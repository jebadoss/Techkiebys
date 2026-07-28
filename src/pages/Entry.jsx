import React, { useRef, useState } from 'react';
import { Bike, Car, Camera, MessageSquareText, CheckCircle2 } from 'lucide-react';
import { vehicleApi } from '../api/client';
import { genToken } from '../data/mock';
import TicketStub from '../components/TicketStub';

const COLORS = ['Red', 'Blue', 'Black', 'White', 'Green', 'Other'];
const CYCLE_TYPES = ['Gear', 'Non-Gear', 'Kids'];

export default function Entry() {
  const [vehicleType, setVehicleType] = useState('bike'); // 'bike' | 'bicycle'
  const [form, setForm] = useState({
    ownerName: '',
    regNo: '',
    phone: '',
    color: COLORS[0],
    cycleType: CYCLE_TYPES[0],
    slot: '',
  });
  const [slotsConfig, setSlotsConfig] = useState({ bike: [], bicycle: [] });
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [photo, setPhoto] = useState(null); // Display URL
  const [photoData, setPhotoData] = useState(null); // Base64 string for DB
  const fileRef = useRef(null);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  React.useEffect(() => {
    vehicleApi.slots().then(res => setSlotsConfig(res.data)).catch(console.error);
    vehicleApi.active().then(res => setActiveVehicles(res.data)).catch(console.error);
  }, []);

  const update = (key) => (e) => {
    let value = e.target.value;
    if (key === 'regNo') {
      value = value.toUpperCase();
    }
    if (key === 'ownerName') {
      if (/[^a-zA-Z\s]/.test(value)) return; // Allow only alphabets and spaces
    }
    if (key === 'phone') {
      if (/[^0-9]/.test(value)) return; // Allow only numbers
    }
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhoto(url);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 600;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round(h * (MAX_DIM / w));
            w = MAX_DIM;
          } else {
            w = Math.round(w * (MAX_DIM / h));
            h = MAX_DIM;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        setPhotoData(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = url;
    }
  };

  // Frequent parker autofill
  React.useEffect(() => {
    if (vehicleType === 'bicycle' && form.phone.length >= 10) {
      vehicleApi.frequent(form.phone)
        .then(({ data }) => {
          if (data && data.color) {
            setForm((f) => ({ ...f, color: data.color, cycleType: data.cycleType }));
            if (data.photoData) {
              setPhotoData(data.photoData);
              setPhoto(data.photoData); // Display the base64 directly
            }
          }
        })
        .catch(() => {});
    }
  }, [form.phone, vehicleType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    if (form.phone.length !== 10) {
      alert('Phone number must be exactly 10 digits');
      setSending(false);
      return;
    }

    const payload = {
      type: vehicleType,
      ownerName: form.ownerName,
      regNo: vehicleType === 'bike' ? form.regNo : null,
      color: vehicleType === 'bicycle' ? form.color : null,
      cycleType: vehicleType === 'bicycle' ? form.cycleType : null,
      photoData: vehicleType === 'bicycle' ? photoData : null,
      phone: form.phone,
      slot: form.slot,
    };

    try {
      const { data } = await vehicleApi.checkIn(payload);
      setResult(data);
    } catch (err) {
      console.error('Failed to check in:', err);
      alert('Failed to check in! ' + (err.response?.data?.message || err.message));
      // Do not set result on failure
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setResult(null);
    setForm({ ownerName: '', regNo: '', phone: '', color: COLORS[0], cycleType: CYCLE_TYPES[0], slot: '' });
    setPhoto(null);
    setPhotoData(null);
    vehicleApi.active().then(res => setActiveVehicles(res.data)).catch(console.error);
  };

  const handleTypeChange = (type) => {
    setVehicleType(type);
    setForm({ ownerName: '', regNo: '', phone: '', color: COLORS[0], cycleType: CYCLE_TYPES[0], slot: '' });
    setPhoto(null);
    setPhotoData(null);
  };

  if (result) {
    return (
      <div className="p-8 max-w-xl">
        <div className="flex items-center gap-2 text-teal mb-4">
          <CheckCircle2 size={20} />
          <h1 className="font-display text-xl font-semibold text-ink">Vehicle checked in</h1>
        </div>

        <TicketStub entry={result} />

        <div className="mt-5 flex items-center gap-2 text-sm text-slate-muted bg-white border border-ink/10 rounded-md px-4 py-3">
          <MessageSquareText size={16} className="text-teal shrink-0" />
          SMS sent to <span className="font-medium text-ink">{result.phone}</span>: "Your vehicle
          is parked at Slot {result.slot}. Token: #{result.token}."
        </div>

        <button
          onClick={reset}
          className="mt-6 px-4 py-2 rounded-md bg-teal text-white text-sm font-medium hover:bg-teal-light"
        >
          Log another vehicle
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-ink">New Entry</h1>
      <p className="text-sm text-slate-muted mb-6">
        System-stamped in-time — no handwriting, no illegible entries.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => handleTypeChange('bike')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border text-sm font-medium transition-colors ${
            vehicleType === 'bike'
              ? 'bg-ink text-white border-ink'
              : 'bg-white text-ink border-ink/15 hover:border-ink/30'
          }`}
        >
          <Car size={16} /> Motorbike
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('bicycle')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md border text-sm font-medium transition-colors ${
            vehicleType === 'bicycle'
              ? 'bg-ink text-white border-ink'
              : 'bg-white text-ink border-ink/15 hover:border-ink/30'
          }`}
        >
          <Bike size={16} /> Bicycle (no reg no.)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
            Owner Name
          </label>
          <input
            required
            value={form.ownerName}
            onChange={update('ownerName')}
            placeholder="John Doe"
            className="w-full px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>

        {vehicleType === 'bike' ? (
          <div>
            <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
              Registration number
            </label>
            <input
              required
              value={form.regNo}
              onChange={update('regNo')}
              placeholder="KA-01-AB-1234"
              className="w-full px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
                  Cycle color
                </label>
                <select
                  value={form.color}
                  onChange={update('color')}
                  className="w-full px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                >
                  {COLORS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
                  Cycle type
                </label>
                <select
                  value={form.cycleType}
                  onChange={update('cycleType')}
                  className="w-full px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                >
                  {CYCLE_TYPES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
                Identifying snapshot
              </label>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-6 rounded-md border-2 border-dashed border-ink/20 text-sm text-slate-muted hover:border-teal hover:text-teal transition-colors overflow-hidden"
              >
                {photo ? (
                  <img src={photo} alt="Cycle snapshot" className="h-20 rounded object-cover" />
                ) : (
                  <>
                    <Camera size={18} /> Take snapshot of frame / sticker
                  </>
                )}
              </button>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
            Phone number
          </label>
          <input
            required
            type="tel"
            maxLength={10}
            value={form.phone}
            onChange={update('phone')}
            placeholder="9876543210"
            className="w-full px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-slate-muted mb-2">
            Select Parking Slot
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(slotsConfig[vehicleType] || []).map(slotName => {
              const occupied = activeVehicles.some(v => v.slot === slotName);
              const selected = form.slot === slotName;
              return (
                <button
                  key={slotName}
                  type="button"
                  disabled={occupied}
                  onClick={() => setForm(f => ({ ...f, slot: slotName }))}
                  className={`py-3 rounded text-center text-sm font-medium border transition-colors ${
                    occupied 
                      ? 'bg-rose-100 text-rose-500 border-rose-200 cursor-not-allowed opacity-60'
                      : selected 
                        ? 'bg-teal text-white border-teal'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {slotName}
                </button>
              );
            })}
          </div>
          {!form.slot && (
            <p className="text-xs text-rose-500 mt-2">Please select an empty green slot.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={sending || !form.slot}
          className="w-full py-3 rounded-md bg-amber text-ink text-sm font-semibold hover:bg-amber-dark transition-colors disabled:opacity-60 mt-4"
        >
          {sending ? 'Generating token…' : 'Generate token & check in'}
        </button>
      </form>
    </div>
  );
}

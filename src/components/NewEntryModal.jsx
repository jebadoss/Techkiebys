import React, { useState, useRef } from 'react';
import { X, Camera, Bike, Upload, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { getFrequentParkers } from '../services/storage';

export default function NewEntryModal({ isOpen, onClose, onSubmitEntry }) {
  if (!isOpen) return null;

  const [type, setType] = useState('BIKE'); // 'BIKE' or 'BICYCLE'
  const [regNumber, setRegNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [cycleColor, setCycleColor] = useState('Black');
  const [cycleCategory, setCycleCategory] = useState('Gear');
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [frequentFound, setFrequentFound] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-lookup frequent parker by phone
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    if (val.length >= 10) {
      const frequent = getFrequentParkers();
      if (frequent[val]) {
        const fp = frequent[val];
        setCycleColor(fp.cycleColor || 'Black');
        setCycleCategory(fp.cycleCategory || 'Gear');
        if (fp.photoUrl) setPhotoUrl(fp.photoUrl);
        setFrequentFound(true);
      } else {
        setFrequentFound(false);
      }
    } else {
      setFrequentFound(false);
    }
  };

  // Start webcam
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      // Fallback sample snapshot
      setPhotoUrl('https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop');
      setCameraActive(false);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotoUrl(dataUrl);

      // Stop camera stream
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setCameraActive(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'BIKE' && !regNumber) {
      alert('Please enter Vehicle Registration Number for Motorized Bike.');
      return;
    }
    if (type === 'BICYCLE' && !phone) {
      alert('Please enter User Phone Number for Bicycle token delivery.');
      return;
    }

    const defaultPhoto = type === 'BICYCLE' && !photoUrl 
      ? 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&auto=format&fit=crop'
      : photoUrl;

    onSubmitEntry({
      type,
      regNumber,
      phone,
      cycleColor,
      cycleCategory,
      photoUrl: defaultPhoto,
      notes
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            <Bike size={22} style={{ color: '#06b6d4' }} />
            <span>New Parking Entry (In-Time)</span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Select Vehicle Category</label>
            <div className="type-selector">
              <div
                className={`type-card ${type === 'BIKE' ? 'active' : ''}`}
                onClick={() => setType('BIKE')}
              >
                <Bike size={28} />
                <h4>Motorized Bike</h4>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Has Reg Number</span>
              </div>
              <div
                className={`type-card ${type === 'BICYCLE' ? 'active' : ''}`}
                onClick={() => setType('BICYCLE')}
              >
                <Bike size={28} style={{ transform: 'rotate(-10deg)' }} />
                <h4>Bicycle / Non-Reg</h4>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Phone + Color + Photo</span>
              </div>
            </div>
          </div>

          {type === 'BIKE' ? (
            <div className="form-group">
              <label className="form-label">Vehicle Registration Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. KA-01-AB-1234"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                required
                autoFocus
              />
              <span className="vehicle-subtitle">Auto-captures current timestamp as In-Time</span>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">User Phone Number (For SMS Token) *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                />
                {frequentFound && (
                  <span style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    <Sparkles size={14} /> Frequent Parker found! Profile auto-filled.
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Cycle Color</label>
                  <select
                    className="form-select"
                    value={cycleColor}
                    onChange={(e) => setCycleColor(e.target.value)}
                  >
                    <option value="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="Blue">Blue</option>
                    <option value="White">White</option>
                    <option value="Silver/Grey">Silver / Grey</option>
                    <option value="Yellow/Orange">Yellow / Orange</option>
                    <option value="Green">Green</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cycle Type</label>
                  <select
                    className="form-select"
                    value={cycleCategory}
                    onChange={(e) => setCycleCategory(e.target.value)}
                  >
                    <option value="Gear">Gear Cycle</option>
                    <option value="Non-Gear">Non-Gear Standard</option>
                    <option value="Kids">Kids Bicycle</option>
                    <option value="Electric">E-Bike / Scooter</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bicycle Photo Snapshot (Unique Identification)</label>
                <div className="camera-box">
                  {photoUrl ? (
                    <div>
                      <img src={photoUrl} alt="Snapshot Preview" className="snapshot-preview" />
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ marginTop: '0.5rem', width: '100%' }}
                        onClick={() => setPhotoUrl('')}
                      >
                        Retake Photo
                      </button>
                    </div>
                  ) : cameraActive ? (
                    <div>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px' }} />
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ marginTop: '0.5rem', width: '100%' }}
                        onClick={captureSnapshot}
                      >
                        Snap Photo
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} style={{ color: '#06b6d4' }} />
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        Take a quick photo of frame, sticker, or scratch
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="btn-secondary" onClick={startCamera}>
                          <Camera size={16} /> Open Camera
                        </button>
                        <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                          <Upload size={16} /> Upload Photo
                          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Optional Attendant Notes</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Helmet placed in Slot B, minor scratch on side"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle2 size={18} />
              <span>Generate Token & Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

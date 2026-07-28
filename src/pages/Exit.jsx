import React, { useEffect, useRef, useState } from 'react';
import { QrCode, Search, Phone, IndianRupee, CheckCircle2, AlertTriangle, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { vehicleApi } from '../api/client';
import { formatDuration } from '../data/mock';
import QRCode from 'react-qr-code';

export default function Exit() {
  const [mode, setMode] = useState('token'); // 'token' | 'phone' | 'scan'
  const [tokenInput, setTokenInput] = useState('');
  const [last4, setLast4] = useState('');
  const [matches, setMatches] = useState([]);
  const [found, setFound] = useState(null);
  
  // Checkout flow states
  const [checkoutFlow, setCheckoutFlow] = useState(null); // The entry being checked out
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [done, setDone] = useState(null);
  const [processing, setProcessing] = useState(false);

  const scannerRef = useRef(null);
  const scannerEl = useRef(null);

  // --- Live QR scanning via html5-qrcode ---
  useEffect(() => {
    if (mode !== 'scan') return;
    const qr = new Html5Qrcode('qr-reader');
    scannerRef.current = qr;
    qr.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 220 },
      (decodedText) => {
        setTokenInput(decodedText);
        lookupByToken(decodedText);
        qr.stop().catch(() => {});
      },
      () => {}
    ).catch(() => {});

    return () => {
      qr.stop().catch(() => {});
    };
  }, [mode]);

  const lookupByToken = async (tok) => {
    const t = (tok || tokenInput).trim().toUpperCase().replace(/^#/, '');
    try {
      const { data } = await vehicleApi.search(t);
      setFound(data.length > 0 ? data[0] : 'not-found');
    } catch {
      setFound('not-found');
    }
  };

  const lookupByPhone = async () => {
    try {
      const { data } = await vehicleApi.searchByPhone(last4);
      setMatches(data);
    } catch {
      setMatches([]);
    }
  };

  const startCheckout = (entry) => {
    setCheckoutFlow(entry);
    if (entry.type === 'bike') {
      setOtpStep(true);
      setOtpInput('');
    } else {
      setOtpStep(false);
    }
  };

  const finalizeCheckout = async () => {
    setProcessing(true);
    try {
      const { data } = await vehicleApi.checkOut(checkoutFlow.token, paymentMethod);
      setDone(data);
      setCheckoutFlow(null);
    } catch (err) {
      alert("Failed to checkout!");
    } finally {
      setProcessing(false);
    }
  };

  // Helper to pre-calculate fee for display
  const estimateFee = (inTime) => {
    const durationMillis = Date.now() - new Date(inTime).getTime();
    let hours = Math.ceil(durationMillis / (1000.0 * 60.0 * 60.0));
    if (hours === 0) hours = 1;
    let fee = 10;
    if (hours > 12) fee += (hours - 12) * 5;
    return fee > 80 ? 80 : fee;
  };

  if (done) {
    return (
      <div className="p-8 max-w-lg">
        <div className="flex items-center gap-2 text-teal mb-4">
          <CheckCircle2 size={24} />
          <h1 className="font-display text-2xl font-semibold text-ink">Release Authorized</h1>
        </div>
        
        {/* Digital Receipt */}
        <div className="bg-white border-2 border-ink border-dashed rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber text-ink text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
            Paid via {done.paymentMethod || 'Cash'}
          </div>
          
          <h2 className="font-display font-semibold text-lg text-ink text-center mb-1">TrackWheel Parking</h2>
          <p className="text-center text-xs text-slate-muted mb-6">Digital Receipt</p>
          
          <div className="flex justify-center mb-6">
            <QRCode value={done.token} size={100} />
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-ink/5 pb-2">
              <span className="text-slate-muted">Token ID</span>
              <span className="font-mono font-semibold text-ink">#{done.token}</span>
            </div>
            <div className="flex justify-between border-b border-ink/5 pb-2">
              <span className="text-slate-muted">Vehicle</span>
              <span className="font-medium text-ink">{done.regNo || `${done.color} ${done.cycleType} Cycle`}</span>
            </div>
            <div className="flex justify-between border-b border-ink/5 pb-2">
              <span className="text-slate-muted">Entry Time</span>
              <span className="text-ink">{new Date(done.inTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-ink/5 pb-2">
              <span className="text-slate-muted">Exit Time</span>
              <span className="text-ink">{new Date(done.outTime).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-ink/5 pb-2">
              <span className="text-slate-muted">Total Hours</span>
              <span className="text-ink font-medium">{formatDuration(done.inTime, done.outTime)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-muted font-medium">Total Paid</span>
              <span className="font-display text-xl font-bold text-teal flex items-center">
                <IndianRupee size={18} />{done.fee}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setDone(null); setFound(null); setMatches([]); setTokenInput(''); setLast4(''); }}
          className="w-full mt-6 px-4 py-3 rounded-md bg-ink text-white text-sm font-semibold hover:bg-ink-light transition-colors"
        >
          Close & Check-out another
        </button>
      </div>
    );
  }

  if (checkoutFlow) {
    const estimatedFee = estimateFee(checkoutFlow.inTime);
    
    if (otpStep) {
      return (
        <div className="p-8 max-w-sm mx-auto mt-10">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6 text-center">
            <Smartphone size={32} className="text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-amber-800 font-medium mb-1">OTP Verification Required</p>
            <p className="text-xs text-amber-700/80 mb-4">
              To prevent theft, a 4-digit OTP has been sent to {checkoutFlow.phone}.
            </p>
            <div className="bg-white p-3 border border-amber-200 text-xs text-slate-500 rounded">
              <strong>Mock Mode:</strong> The OTP is exactly <strong>1234</strong>
            </div>
          </div>
          
          <input
            type="text"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value)}
            placeholder="Enter OTP (1234)"
            maxLength={4}
            className="w-full text-center tracking-[1em] text-2xl font-mono px-4 py-3 rounded-md border border-ink/20 focus:outline-none focus:ring-2 focus:ring-teal mb-4"
          />
          
          <div className="flex gap-2">
            <button onClick={() => setCheckoutFlow(null)} className="flex-1 py-3 rounded border font-medium text-sm text-slate-600">Cancel</button>
            <button 
              onClick={() => {
                if (otpInput === '1234') setOtpStep(false);
                else alert("Invalid OTP!");
              }}
              className="flex-1 py-3 rounded bg-teal text-white font-medium text-sm"
            >
              Verify OTP
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8 max-w-md mx-auto mt-10">
        <h1 className="font-display text-2xl font-semibold text-ink mb-6 text-center">Payment & Release</h1>
        
        <div className="bg-paper p-5 rounded-lg text-center mb-6 border border-ink/10">
          <p className="text-sm text-slate-muted mb-1">Amount to Collect</p>
          <div className="flex items-center justify-center gap-1 font-display text-4xl font-bold text-amber-dark">
            <IndianRupee size={32} />{estimatedFee}
          </div>
          <p className="text-xs text-slate-muted mt-2">For {formatDuration(checkoutFlow.inTime)} of parking</p>
        </div>

        <p className="text-sm font-medium text-ink mb-3">Select Payment Method</p>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => setPaymentMethod('CASH')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${paymentMethod === 'CASH' ? 'border-teal bg-teal-50 text-teal-700' : 'border-ink/10 text-slate-500 hover:border-teal/50'}`}
          >
            <Banknote size={24} /> <span className="text-xs font-bold">CASH</span>
          </button>
          <button
            onClick={() => setPaymentMethod('UPI')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${paymentMethod === 'UPI' ? 'border-teal bg-teal-50 text-teal-700' : 'border-ink/10 text-slate-500 hover:border-teal/50'}`}
          >
            <Smartphone size={24} /> <span className="text-xs font-bold">UPI</span>
          </button>
          <button
            onClick={() => setPaymentMethod('CARD')}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${paymentMethod === 'CARD' ? 'border-teal bg-teal-50 text-teal-700' : 'border-ink/10 text-slate-500 hover:border-teal/50'}`}
          >
            <CreditCard size={24} /> <span className="text-xs font-bold">CARD</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button disabled={processing} onClick={() => setCheckoutFlow(null)} className="px-6 py-3 rounded border font-medium text-sm text-slate-600">Back</button>
          <button 
            disabled={processing}
            onClick={finalizeCheckout}
            className="flex-1 py-3 rounded bg-amber text-ink font-bold text-sm hover:bg-amber-dark transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-ink">Check-out</h1>
      <p className="text-sm text-slate-muted mb-6">
        Look up by token, QR scan, or the last 4 digits of the phone number.
      </p>

      <div className="flex gap-2 mb-6 text-sm">
        {[
          { id: 'token', label: 'Token', icon: Search },
          { id: 'scan', label: 'Scan QR', icon: QrCode },
          { id: 'phone', label: 'Phone (last 4)', icon: Phone },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setMode(id); setFound(null); setMatches([]); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md border font-medium ${
              mode === id ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-ink/15 hover:bg-paper'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {mode === 'token' && (
        <div className="flex gap-2">
          <input
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="#BK-20260724-001"
            className="flex-1 px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber uppercase"
          />
          <button
            onClick={() => lookupByToken()}
            className="px-6 py-2.5 rounded-md bg-teal text-white text-sm font-semibold hover:bg-teal-light"
          >
            Find
          </button>
        </div>
      )}

      {mode === 'scan' && (
        <div>
          <div id="qr-reader" ref={scannerEl} className="rounded-lg overflow-hidden border border-ink/10" />
          <p className="text-xs text-slate-muted mt-2 text-center">
            Point the tablet camera at the user's Token QR code.
          </p>
        </div>
      )}

      {mode === 'phone' && (
        <div>
          <div className="flex gap-2">
            <input
              value={last4}
              onChange={(e) => setLast4(e.target.value.slice(0, 4))}
              placeholder="3210"
              maxLength={4}
              className="flex-1 px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
            />
            <button
              onClick={lookupByPhone}
              className="px-6 py-2.5 rounded-md bg-teal text-white text-sm font-semibold hover:bg-teal-light"
            >
              Find
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {matches.map((v) => (
              <ResultRow key={v.token} entry={v} onCheckout={startCheckout} />
            ))}
          </div>
        </div>
      )}

      {found && found !== 'not-found' && (
        <div className="mt-4">
          <ResultRow entry={found} onCheckout={startCheckout} />
        </div>
      )}
      {found === 'not-found' && (
        <p className="mt-4 text-sm text-alert flex items-center gap-2">
          <AlertTriangle size={16} /> No active vehicle matches that token.
        </p>
      )}
    </div>
  );
}

function ResultRow({ entry, onCheckout }) {
  return (
    <div className="flex items-center justify-between bg-white border border-ink/10 rounded-md px-4 py-3 shadow-sm hover:border-teal/50 transition-colors">
      <div className="flex items-center gap-4">
        {entry.photoData && (
          <img src={entry.photoData} alt="Cycle" className="w-14 h-14 object-cover rounded bg-paper shrink-0" />
        )}
        <div>
          <p className="font-mono text-sm font-bold text-ink">#{entry.token}</p>
          <p className="text-xs text-slate-muted mt-0.5">
            {entry.regNo || `${entry.color} · ${entry.cycleType}`} · Slot <span className="font-bold text-ink">{entry.slot}</span>
          </p>
          <p className="text-xs text-teal font-medium mt-1">
            {formatDuration(entry.inTime)} parked
          </p>
        </div>
      </div>
      <button
        onClick={() => onCheckout(entry)}
        className="px-4 py-2 rounded-md bg-amber text-ink text-xs font-bold hover:bg-amber-dark transition-colors"
      >
        Check-out
      </button>
    </div>
  );
}

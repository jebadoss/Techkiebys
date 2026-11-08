import React, { useState } from 'react';
import { X, CheckCircle2, Clock, DollarSign, Bike, ShieldCheck, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateFee } from '../services/storage';

export default function CheckoutModal({ entry, onClose, onConfirmCheckout }) {
  if (!entry) return null;

  const [checkoutNotes, setCheckoutNotes] = useState('');
  const outTime = new Date();

  const feeCalc = calculateFee(entry.inTime, outTime, entry.type);

  const formatDateTime = (isoStr) => {
    return new Date(isoStr).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  const handleCheckout = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    onConfirmCheckout(entry.id, feeCalc.fee, checkoutNotes);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h3>
            <DollarSign size={22} style={{ color: '#10b981' }} />
            <span>Vehicle Exit & Cash Collection</span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Top Info Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span className="token-badge">{entry.tokenId}</span>
              <span className="slot-badge" style={{ marginLeft: '0.6rem' }}>Slot {entry.slotNumber}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>
                {entry.type === 'BIKE' ? entry.regNumber : `${entry.cycleColor} ${entry.cycleCategory} Cycle`}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Phone: {entry.phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Photo Snapshot Verification (Crucial for Bicycles!) */}
          {entry.photoUrl && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4' }}>
                <ShieldCheck size={16} /> Visual Photo Match (Verify Scratch / Sticker)
              </label>
              <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.3)', maxHeight: '200px', display: 'flex', justifyContent: 'center' }}>
                <img src={entry.photoUrl} alt="Vehicle Snapshot" style={{ maxHeight: '200px', objectFit: 'contain' }} />
              </div>
            </div>
          )}

          {/* Time & Duration Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>In-Time</span>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '0.2rem' }}>{formatDateTime(entry.inTime)}</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Out-Time</span>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '0.2rem', color: '#06b6d4' }}>{formatDateTime(outTime)}</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Duration</span>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f59e0b', marginTop: '0.2rem' }}>{feeCalc.totalHours} Hours</div>
            </div>
          </div>

          {/* Fee Calculation Highlight */}
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))', border: '1px solid #10b981', borderRadius: '14px', padding: '1.2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Calculated Parking Fee</span>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981', margin: '0.2rem 0' }}>
              ₹{feeCalc.fee}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              {feeCalc.breakdown}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Exit Note (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cash collected, customer verified token"
              value={checkoutNotes}
              onChange={(e) => setCheckoutNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }} onClick={handleCheckout}>
              <CheckCircle2 size={18} />
              <span>Check-out & Collect ₹{feeCalc.fee}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

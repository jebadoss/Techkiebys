import React, { useState } from 'react';
import { X, DollarSign, ShieldAlert, CheckCircle2, Calculator, Lock } from 'lucide-react';
import { getShiftData, saveShiftData } from '../services/storage';

export default function CashDrawerModal({ isOpen, onClose, totalExpectedCash, completedCount }) {
  if (!isOpen) return null;

  const shift = getShiftData();

  const [notes500, setNotes500] = useState(0);
  const [notes200, setNotes200] = useState(0);
  const [notes100, setNotes100] = useState(0);
  const [notes50, setNotes50] = useState(0);
  const [notes20, setNotes20] = useState(0);
  const [notes10, setNotes10] = useState(0);
  const [coins, setCoins] = useState(0);
  const [shiftClosed, setShiftClosed] = useState(false);

  const actualCashTotal = 
    (Number(notes500) * 500) +
    (Number(notes200) * 200) +
    (Number(notes100) * 100) +
    (Number(notes50) * 50) +
    (Number(notes20) * 20) +
    (Number(notes10) * 10) +
    Number(coins);

  const variance = actualCashTotal - totalExpectedCash;

  const handleCloseShift = () => {
    const updatedShift = {
      ...shift,
      status: 'CLOSED',
      endTime: new Date().toISOString(),
      expectedCash: totalExpectedCash,
      actualCash: actualCashTotal,
      variance,
      vehiclesHandled: completedCount
    };
    saveShiftData(updatedShift);
    setShiftClosed(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <h3>
            <DollarSign size={22} style={{ color: '#10b981' }} />
            <span>Daily Cash Reconciliation & Shift Closing</span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Shift Header Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Shift Register Summary</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginTop: '0.2rem' }}>{completedCount} Exited Vehicles</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Shift ID: {shift.shiftId}</div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15))', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-focus)' }}>
              <span style={{ fontSize: '0.8rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: '700' }}>Expected Register Revenue</span>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#06b6d4', marginTop: '0.1rem' }}>₹{totalExpectedCash}</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>System calculated total from tickets</div>
            </div>
          </div>

          {/* Currency Denomination Counter */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calculator size={16} /> Count Cash Notes in Drawer
            </label>
            <div className="cash-grid">
              <div className="cash-note-item">
                <span className="cash-note-label">₹500 Notes</span>
                <input type="number" min="0" className="form-input" value={notes500 || ''} onChange={(e) => setNotes500(e.target.value)} placeholder="0" />
              </div>
              <div className="cash-note-item">
                <span className="cash-note-label">₹200 Notes</span>
                <input type="number" min="0" className="form-input" value={notes200 || ''} onChange={(e) => setNotes200(e.target.value)} placeholder="0" />
              </div>
              <div className="cash-note-item">
                <span className="cash-note-label">₹100 Notes</span>
                <input type="number" min="0" className="form-input" value={notes100 || ''} onChange={(e) => setNotes100(e.target.value)} placeholder="0" />
              </div>
              <div className="cash-note-item">
                <span className="cash-note-label">₹50 Notes</span>
                <input type="number" min="0" className="form-input" value={notes50 || ''} onChange={(e) => setNotes50(e.target.value)} placeholder="0" />
              </div>
              <div className="cash-note-item">
                <span className="cash-note-label">₹20 Notes</span>
                <input type="number" min="0" className="form-input" value={notes20 || ''} onChange={(e) => setNotes20(e.target.value)} placeholder="0" />
              </div>
              <div className="cash-note-item">
                <span className="cash-note-label">₹10 Notes</span>
                <input type="number" min="0" className="form-input" value={notes10 || ''} onChange={(e) => setNotes10(e.target.value)} placeholder="0" />
              </div>
              <div className="cash-note-item">
                <span className="cash-note-label">Coins (₹1/2/5)</span>
                <input type="number" min="0" className="form-input" value={coins || ''} onChange={(e) => setCoins(e.target.value)} placeholder="₹0" />
              </div>
            </div>
          </div>

          {/* Variance Comparison Box */}
          <div style={{ background: variance === 0 ? 'rgba(16, 185, 129, 0.15)' : variance < 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', border: `1px solid ${variance === 0 ? '#10b981' : variance < 0 ? '#f43f5e' : '#f59e0b'}`, borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Counted Physical Cash</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>₹{actualCashTotal}</div>
              </div>
              <div style={{ height: '30px', width: '1px', background: 'var(--border-subtle)' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Discrepancy (Variance)</span>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: variance === 0 ? '#10b981' : variance < 0 ? '#f43f5e' : '#f59e0b' }}>
                  {variance === 0 ? 'Exact Match (₹0)' : variance < 0 ? `-₹${Math.abs(variance)} (Shortage)` : `+₹${variance} (Surplus)`}
                </div>
              </div>
            </div>
            {variance < 0 && (
              <div style={{ fontSize: '0.8rem', color: '#f43f5e', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                <ShieldAlert size={14} /> Cash drawer is short by ₹{Math.abs(variance)}. Attendant explanation required before shift close.
              </div>
            )}
          </div>

          {shiftClosed ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#10b981', fontWeight: '700' }}>
              <CheckCircle2 size={24} style={{ margin: '0 auto 0.4rem', display: 'block' }} />
              Shift Closed Successfully! Report saved to Daily Logs.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }} onClick={handleCloseShift}>
                <Lock size={16} />
                <span>Reconcile & Close Shift</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

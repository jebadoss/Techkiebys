import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, Send, Smartphone, Check, Printer, Copy, MessageSquare } from 'lucide-react';

export default function DigitalTokenModal({ entry, onClose }) {
  if (!entry) return null;

  const [smsSent, setSmsSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedTime = new Date(entry.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const smsText = `Your ${entry.type === 'BIKE' ? 'Bike (' + entry.regNumber + ')' : entry.cycleColor + ' Cycle'} is parked at Slot ${entry.slotNumber}. Token: ${entry.tokenId}. In-Time: ${formattedTime}. Show this SMS/QR at exit.`;

  const handleSendSMS = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>
            <Smartphone size={22} style={{ color: '#f59e0b' }} />
            <span>Digital Token Generated</span>
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center' }}>
          <div className="sms-token-box">
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Parking Slot: <strong style={{ color: '#06b6d4' }}>{entry.slotNumber}</strong>
            </span>

            <div className="large-token">{entry.tokenId}</div>

            <div className="qr-wrapper">
              <QRCode
                value={`https://trackwheel.app/token/${entry.tokenId.replace('#', '')}`}
                size={140}
              />
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'left', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#06b6d4', fontWeight: '700', marginBottom: '0.25rem' }}>
                <MessageSquare size={14} /> SMS / WhatsApp Notification Preview:
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                "{smsText}"
              </p>
            </div>
          </div>

          {smsSent && (
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Check size={16} /> SMS successfully sent to {entry.phone || 'customer'}!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', marginTop: '0.5rem' }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSendSMS}>
              <Send size={18} />
              <span>Send SMS / WhatsApp Token</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={handleCopy}>
                {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy SMS Text'}</span>
              </button>

              <button className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Small Chit</span>
              </button>
            </div>
          </div>

          <button className="btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={onClose}>
            Done & Back to Register
          </button>
        </div>
      </div>
    </div>
  );
}

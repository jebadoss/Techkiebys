import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, PhoneCall, LogOut, Eye, Search, Bike } from 'lucide-react';

export default function ActiveRegister({ entries, onSelectCheckout, onSelectViewToken, overstayThresholdHours = 8 }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (inTimeISO) => {
    const diffMs = Math.max(0, now - new Date(inTimeISO).getTime());
    const totalSecs = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return {
      text: `${hrs}h ${pad(mins)}m ${pad(secs)}s`,
      totalHours: totalSecs / 3600,
      isOverstay: (totalSecs / 3600) >= overstayThresholdHours
    };
  };

  const activeEntries = entries.filter(e => e.status === 'ACTIVE');

  return (
    <div className="register-table-container">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Slot & Token</th>
              <th>Vehicle / Identification</th>
              <th>Phone Number</th>
              <th>In-Time</th>
              <th>Live Parking Elapsed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeEntries.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Bike size={40} style={{ margin: '0 auto 0.5rem', display: 'block', opacity: 0.4 }} />
                  No active vehicles parked right now. Click "New Entry" to add one!
                </td>
              </tr>
            ) : (
              activeEntries.map((entry) => {
                const duration = formatDuration(entry.inTime);
                const isOverstay = duration.isOverstay;

                return (
                  <tr key={entry.id} className={isOverstay ? 'overstay-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span className="slot-badge">Slot {entry.slotNumber}</span>
                        <span className="token-badge">{entry.tokenId}</span>
                      </div>
                    </td>

                    <td>
                      <div className="vehicle-info-cell">
                        {entry.photoUrl ? (
                          <img src={entry.photoUrl} alt="Thumbnail" className="vehicle-thumb" />
                        ) : (
                          <div className="vehicle-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bike size={20} style={{ color: '#06b6d4' }} />
                          </div>
                        )}
                        <div className="vehicle-details">
                          <div className="vehicle-title">
                            {entry.type === 'BIKE' ? entry.regNumber : `${entry.cycleColor || 'Standard'} ${entry.cycleCategory || 'Cycle'}`}
                          </div>
                          <div className="vehicle-subtitle">
                            Category: {entry.type === 'BIKE' ? 'Motorized Bike' : 'Bicycle'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '600', color: '#fff' }}>
                        {entry.phone ? entry.phone : 'N/A'}
                      </div>
                      {entry.phone && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Last 4 digits: <strong style={{ color: '#06b6d4' }}>{entry.phone.slice(-4)}</strong>
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                        {new Date(entry.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(entry.inTime).toLocaleDateString()}
                      </div>
                    </td>

                    <td>
                      <div className="timer-live" style={{ color: isOverstay ? '#f43f5e' : '#10b981' }}>
                        <Clock size={16} />
                        <span>{duration.text}</span>
                      </div>
                      {isOverstay && (
                        <div className="overstay-badge" style={{ marginTop: '0.3rem' }}>
                          <AlertTriangle size={12} /> OVERSTAY (&gt;8h)
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          title="View Digital Token / QR"
                          onClick={() => onSelectViewToken(entry)}
                        >
                          <Eye size={15} />
                        </button>

                        {isOverstay && entry.phone && (
                          <a
                            href={`tel:${entry.phone}`}
                            className="btn-danger"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', textDecoration: 'none' }}
                            title="Call User for Overstay"
                          >
                            <PhoneCall size={15} />
                          </a>
                        )}

                        <button
                          className="btn-primary"
                          style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => onSelectCheckout(entry)}
                        >
                          <LogOut size={15} />
                          <span>Exit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

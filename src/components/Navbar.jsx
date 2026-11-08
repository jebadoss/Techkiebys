import React, { useState, useEffect } from 'react';
import { ShieldCheck, PlusCircle, DollarSign, Clock, Bike, RefreshCw } from 'lucide-react';

export default function Navbar({ activeCount, overstayCount, onOpenNewEntry, onOpenCashDrawer, onRefresh }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="navbar">
      <div className="brand-section">
        <div className="brand-icon">
          <Bike size={26} />
        </div>
        <div>
          <h1 className="brand-title">TrackWheel</h1>
          <span className="brand-subtitle">Digital Register & SMS Token</span>
        </div>
      </div>

      <div className="nav-stats">
        <div className="stat-pill">
          <Clock size={16} style={{ color: '#06b6d4' }} />
          <span>{time}</span>
        </div>

        <div className="stat-pill">
          <span>Active Parked: <strong>{activeCount}</strong></span>
        </div>

        {overstayCount > 0 && (
          <div className="stat-pill" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', background: 'rgba(244, 63, 94, 0.12)' }}>
            <span style={{ color: '#f43f5e', fontWeight: '800' }}>⚡ {overstayCount} Overstay</span>
          </div>
        )}
      </div>

      <div className="nav-actions">
        <button className="btn-secondary" onClick={onRefresh} title="Sync Live Data">
          <RefreshCw size={18} />
        </button>

        <button className="btn-secondary" onClick={onOpenCashDrawer}>
          <DollarSign size={18} style={{ color: '#10b981' }} />
          <span>Cash Drawer</span>
        </button>

        <button className="btn-primary" onClick={onOpenNewEntry}>
          <PlusCircle size={20} />
          <span>New Entry</span>
        </button>
      </div>
    </nav>
  );
}

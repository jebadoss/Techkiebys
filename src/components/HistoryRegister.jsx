import React, { useState } from 'react';
import { Download, Search, CheckCircle, Calendar, Bike } from 'lucide-react';

export default function HistoryRegister({ entries }) {
  const [searchTerm, setSearchTerm] = useState('');

  const completedEntries = entries.filter(e => e.status === 'COMPLETED');

  const filteredHistory = completedEntries.filter(e => {
    const term = searchTerm.toLowerCase();
    return (
      e.tokenId.toLowerCase().includes(term) ||
      (e.regNumber && e.regNumber.toLowerCase().includes(term)) ||
      (e.phone && e.phone.includes(term)) ||
      (e.cycleColor && e.cycleColor.toLowerCase().includes(term))
    );
  });

  const totalFeeCollected = filteredHistory.reduce((sum, e) => sum + (e.feePaid || 0), 0);

  const exportCSV = () => {
    const headers = ['Token,Type,Reg/Color,Phone,In-Time,Out-Time,Fee Paid,Slot,Notes\n'];
    const rows = filteredHistory.map(e => [
      `"${e.tokenId}"`,
      `"${e.type}"`,
      `"${e.type === 'BIKE' ? e.regNumber : e.cycleColor + ' Cycle'}"`,
      `"${e.phone || ''}"`,
      `"${e.inTime}"`,
      `"${e.outTime || ''}"`,
      `"${e.feePaid || 0}"`,
      `"${e.slotNumber}"`,
      `"${e.notes || ''}"`
    ].join(','));

    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TrackWheel_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="register-table-container">
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div className="search-input-group" style={{ minWidth: '240px' }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search history by Token, Phone, Reg No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', color: '#10b981', fontWeight: '700' }}>
            Total Revenue: ₹{totalFeeCollected}
          </div>

          <button className="btn-secondary" onClick={exportCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Token & Slot</th>
              <th>Vehicle Description</th>
              <th>Phone</th>
              <th>In / Out Timestamps</th>
              <th>Fee Collected</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  No completed parking records match your filter.
                </td>
              </tr>
            ) : (
              filteredHistory.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <span className="token-badge">{entry.tokenId}</span>
                    <span className="slot-badge" style={{ marginLeft: '0.4rem' }}>{entry.slotNumber}</span>
                  </td>

                  <td>
                    <div style={{ fontWeight: '700', color: '#fff' }}>
                      {entry.type === 'BIKE' ? entry.regNumber : `${entry.cycleColor} ${entry.cycleCategory}`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {entry.type} {entry.notes && `| ${entry.notes}`}
                    </div>
                  </td>

                  <td style={{ color: '#cbd5e1', fontWeight: '600' }}>
                    {entry.phone || 'N/A'}
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      In: {new Date(entry.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#06b6d4' }}>
                      Out: {entry.outTime ? new Date(entry.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </div>
                  </td>

                  <td style={{ fontWeight: '800', color: '#10b981', fontSize: '1.05rem' }}>
                    ₹{entry.feePaid || 0}
                  </td>

                  <td>
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={12} /> PAID & EXITED
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

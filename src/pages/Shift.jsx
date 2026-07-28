import React, { useState } from 'react';
import { Wallet, IndianRupee, CheckCircle2, AlertTriangle } from 'lucide-react';
import { shiftApi } from '../api/client';
import { useEffect } from 'react';

export default function Shift() {
  const [expected, setExpected] = useState({ expected: 0, vehicles: 0 });
  const [counted, setCounted] = useState('');
  const [closed, setClosed] = useState(null);

  useEffect(() => {
    shiftApi.summary().then(({ data }) => setExpected(data)).catch(() => {});
  }, []);

  const diff = counted === '' ? null : Number(counted) - (expected.expected || 0);

  const closeShift = async () => {
    try {
      const { data } = await shiftApi.close({ countedCash: Number(counted) });
      setClosed(data);
    } catch {
      setClosed({ countedCash: Number(counted), expected: expected.expected, diff });
    }
  };

  if (closed) {
    return (
      <div className="p-8 max-w-md">
        <div className="flex items-center gap-2 text-teal mb-4">
          <CheckCircle2 size={20} />
          <h1 className="font-display text-xl font-semibold text-ink">Shift closed</h1>
        </div>
        <div className="bg-white border border-ink/10 rounded-lg p-6 space-y-2 text-sm">
          <Row label="Expected" value={`₹${closed.expected}`} />
          <Row label="Counted" value={`₹${closed.countedCash}`} />
          <Row
            label="Difference"
            value={closed.diff === 0 ? 'Matched' : `${closed.diff > 0 ? '+' : ''}₹${closed.diff}`}
            accent={closed.diff === 0 ? 'teal' : 'alert'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md">
      <div className="flex items-center gap-2 mb-1">
        <Wallet size={20} className="text-teal" />
        <h1 className="font-display text-2xl font-semibold text-ink">Cash Shift</h1>
      </div>
      <p className="text-sm text-slate-muted mb-6">
        Count your drawer and reconcile against the system total before closing.
      </p>

      <div className="bg-white border border-ink/10 rounded-lg p-6 mb-4">
        <p className="text-xs uppercase tracking-wide text-slate-muted">System expects</p>
        <p className="flex items-center gap-1 font-display text-3xl font-semibold text-ink mt-1">
          <IndianRupee size={22} />{expected.expected || 0}
        </p>
        <p className="text-xs text-slate-muted mt-1">based on completed tickets</p>
      </div>

      <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
        Counted cash in drawer
      </label>
      <input
        type="number"
        value={counted}
        onChange={(e) => setCounted(e.target.value)}
        placeholder="450"
        className="w-full px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber"
      />

      {diff !== null && diff !== 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-alert">
          <AlertTriangle size={14} />
          {diff > 0 ? `₹${diff} more than expected` : `₹${Math.abs(diff)} short`}
        </p>
      )}

      <button
        onClick={closeShift}
        disabled={counted === ''}
        className="mt-6 w-full py-3 rounded-md bg-amber text-ink text-sm font-semibold hover:bg-amber-dark disabled:opacity-60"
      >
        Close shift
      </button>
    </div>
  );
}

function Row({ label, value, accent }) {
  const cls = accent === 'teal' ? 'text-teal' : accent === 'alert' ? 'text-alert' : 'text-ink';
  return (
    <div className="flex justify-between border-t border-ink/5 first:border-t-0 pt-2 first:pt-0">
      <span className="text-slate-muted">{label}</span>
      <span className={`font-medium ${cls}`}>{value}</span>
    </div>
  );
}

import React from 'react';

export default function StatCard({ label, value, accent = 'ink', sub }) {
  const accentClass = {
    ink: 'text-ink',
    teal: 'text-teal',
    amber: 'text-amber-dark',
    alert: 'text-alert',
  }[accent];

  return (
    <div className="bg-white rounded-lg border border-ink/10 px-5 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${accentClass}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-muted">{sub}</p>}
    </div>
  );
}

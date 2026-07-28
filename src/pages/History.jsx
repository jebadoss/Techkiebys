import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { formatDuration } from '../data/mock';
import { vehicleApi } from '../api/client';

export default function History() {
  const [rows, setRows] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);

  useEffect(() => {
    vehicleApi.history(date).then(({ data }) => setRows(data)).catch(() => {});
  }, [date]);


  return (
    <div className="p-8 max-w-5xl print:p-0 print:max-w-full">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">History</h1>
          <p className="text-sm text-slate-muted">Every entry and exit — searchable, exportable, never lost.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-md border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-rose-600 text-white text-sm font-medium hover:bg-rose-700"
          >
            <FileText size={14} /> Export PDF
          </button>
        </div>
      </div>
      
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">TrackWheel Parking Report</h1>
        <p className="text-sm text-gray-600">Date: {date}</p>
      </div>

      <div className="bg-white rounded-lg border border-ink/10 overflow-hidden print:border-0">
        <table className="w-full text-sm print:text-xs">
          <thead className="bg-paper text-left text-xs uppercase tracking-wide text-slate-muted">
            <tr>
              <th className="px-4 py-3">Token</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Fee</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.token} className="border-t border-ink/5 hover:bg-paper/60">
                <td className="px-4 py-3 font-mono text-ink">#{r.token}</td>
                <td className="px-4 py-3 text-ink">{r.regNo || `${r.color} cycle`}</td>
                <td className="px-4 py-3">{r.slot}</td>
                <td className="px-4 py-3">{formatDuration(r.inTime, r.outTime)}</td>
                <td className="px-4 py-3 font-medium text-amber-dark">₹{r.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

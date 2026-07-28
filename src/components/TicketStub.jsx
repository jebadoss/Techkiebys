import React from 'react';
import QRCode from 'react-qr-code';
import { Bike, Car } from 'lucide-react';

// The signature element: every generated token renders as a literal
// paper ticket stub — dashed tear line, punched notches, monospace
// token in "stamped" type — echoing the physical token it replaces.
export default function TicketStub({ entry, compact = false }) {
  const isBike = entry.type === 'bike';
  const label = isBike ? entry.regNo : `${entry.color} · ${entry.cycleType}`;

  return (
    <div
      className={`relative flex bg-white rounded-lg shadow-sm border border-ink/10 overflow-hidden ${
        compact ? 'max-w-sm' : 'max-w-md'
      }`}
    >
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 text-teal">
          {isBike ? <Car size={16} /> : <Bike size={16} />}
          <span className="font-display text-xs uppercase tracking-widest">
            {isBike ? 'Motorbike' : 'Bicycle'}
          </span>
        </div>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-wider text-ink">
          #{entry.token}
        </p>
        <p className="mt-1 text-sm text-slate-muted">{label}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-slate-muted uppercase tracking-wide">Slot</p>
            <p className="font-medium text-ink">{entry.slot}</p>
          </div>
          <div>
            <p className="text-slate-muted uppercase tracking-wide">In-time</p>
            <p className="font-medium text-ink">
              {new Date(entry.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <div className="tear-line" />

      <div className="flex flex-col items-center justify-center gap-2 p-4 bg-paper w-28 shrink-0">
        <QRCode value={entry.token} size={72} fgColor="#1B2430" bgColor="transparent" />
        <span className="font-mono text-[10px] text-slate-muted">SCAN AT EXIT</span>
      </div>

      {/* Punched notches to sell the "stub" illusion */}
      <div className="absolute left-[calc(100%-7rem)] -top-2 w-4 h-4 rounded-full bg-paper" />
      <div className="absolute left-[calc(100%-7rem)] -bottom-2 w-4 h-4 rounded-full bg-paper" />
    </div>
  );
}

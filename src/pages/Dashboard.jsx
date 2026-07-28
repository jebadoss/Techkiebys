import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, Bike, Car, IndianRupee, Activity, TrendingUp, Users } from 'lucide-react';
import { formatDuration } from '../data/mock';
import { vehicleApi } from '../api/client';
import StatCard from '../components/StatCard';

const OVERSTAY_HOURS = 8;

export default function Dashboard() {
  const [active, setActive] = useState([]);
  const [stats, setStats] = useState({
    todayEntries: 0,
    todayExits: 0,
    activeVehicles: 0,
    todayIncome: 0,
  });
  const [query, setQuery] = useState('');
  const [, forceTick] = useState(0);

  useEffect(() => {
    Promise.all([
      vehicleApi.active(),
      vehicleApi.stats()
    ]).then(([activeRes, statsRes]) => {
      setActive(activeRes.data);
      setStats(statsRes.data);
    }).catch(() => {});
    
    const t = setInterval(() => forceTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return active;
    const q = query.toLowerCase();
    return active.filter(
      (v) =>
        v.token.toLowerCase().includes(q) ||
        v.regNo?.toLowerCase().includes(q) ||
        v.phone.includes(q)
    );
  }, [active, query]);

  const overstays = active.filter((v) => Date.now() - new Date(v.inTime).getTime() > OVERSTAY_HOURS * 3600000);
  const bikes = active.filter((v) => v.type === 'bike').length;
  const bicycles = active.filter((v) => v.type === 'bicycle').length;

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-slate-muted">Live view of the parking facility</p>
        </div>
        <div className="flex gap-2">
          <Link to="/entry" className="px-4 py-2 rounded-md bg-teal text-white text-sm font-medium hover:bg-teal-light">
            + New Entry
          </Link>
          <Link to="/exit" className="px-4 py-2 rounded-md bg-ink text-white text-sm font-medium hover:bg-ink-light">
            Check-out
          </Link>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg border border-ink/10 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-slate-muted mb-1 font-medium">Today's Income</p>
            <p className="text-2xl font-semibold text-ink">₹{stats.todayIncome}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <IndianRupee size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-ink/10 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-slate-muted mb-1 font-medium">Today's Entries</p>
            <p className="text-2xl font-semibold text-ink">{stats.todayEntries}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-ink/10 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-slate-muted mb-1 font-medium">Today's Exits</p>
            <p className="text-2xl font-semibold text-ink">{stats.todayExits}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Activity size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-ink/10 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm text-slate-muted mb-1 font-medium">Currently Parked</p>
            <p className="text-2xl font-semibold text-ink">{stats.activeVehicles}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <Users size={20} />
          </div>
        </div>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search token, reg no, or phone…"
          className="w-full pl-9 pr-3 py-2 rounded-md border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber"
        />
      </div>

      <div className="bg-white rounded-lg border border-ink/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-wide text-slate-muted">
            <tr>
              <th className="px-4 py-3">Token</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">In-time</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const overstay = Date.now() - new Date(v.inTime).getTime() > OVERSTAY_HOURS * 3600000;
              return (
                <tr key={v.token} className="border-t border-ink/5 hover:bg-paper/60">
                  <td className="px-4 py-3 font-mono font-medium text-ink">#{v.token}</td>
                  <td className="px-4 py-3 text-ink font-medium">{v.ownerName || '-'}</td>
                  <td className="px-4 py-3 font-mono">{v.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-ink">
                      {v.type === 'bike' ? <Car size={15} className="text-teal" /> : <Bike size={15} className="text-teal" />}
                      {v.type === 'bike' ? v.regNo : `${v.color} · ${v.cycleType}`}
                    </div>
                  </td>
                  <td className="px-4 py-3">{v.slot}</td>
                  <td className="px-4 py-3">
                    {new Date(v.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">{formatDuration(v.inTime)}</td>
                  <td className="px-4 py-3">
                    {overstay ? (
                      <span className="inline-flex items-center gap-1 text-alert font-medium">
                        <AlertTriangle size={14} /> Overstay
                      </span>
                    ) : (
                      <span className="text-teal font-medium">Active</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-muted text-sm">
                  No matching vehicles parked right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

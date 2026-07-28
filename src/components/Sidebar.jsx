import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, LogIn, LogOut, History, Wallet, ParkingCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Live Register', icon: LayoutGrid },
  { to: '/entry', label: 'New Entry', icon: LogIn },
  { to: '/exit', label: 'Check-out', icon: LogOut },
  { to: '/history', label: 'History', icon: History },
  { to: '/shift', label: 'Cash Shift', icon: Wallet },
];

export default function Sidebar() {
  const { attendant, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 bg-ink text-paper flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-6">
        <ParkingCircle className="text-amber" size={26} />
        <span className="font-display text-lg font-semibold tracking-tight">TrackWheel</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-amber text-ink font-medium'
                  : 'text-paper/70 hover:bg-ink-light hover:text-paper'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-xs text-paper/50 uppercase tracking-wide">Signed in</p>
        <p className="text-sm font-medium">{attendant?.name || 'Attendant'}</p>
        <button
          onClick={logout}
          className="mt-2 text-xs text-amber hover:underline"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

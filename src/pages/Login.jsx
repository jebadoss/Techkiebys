import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParkingCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-paper rounded-xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-2 mb-1">
          <ParkingCircle className="text-teal" size={28} />
          <span className="font-display text-xl font-semibold text-ink">TrackWheel</span>
        </div>
        <p className="text-sm text-slate-muted mb-6">Attendant sign-in · Gate console</p>

        <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
          Username
        </label>
        <input
          className="w-full mb-4 px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="attendant.gate1"
          required
        />

        <label className="block text-xs uppercase tracking-wide text-slate-muted mb-1">
          Password
        </label>
        <input
          type="password"
          className="w-full mb-6 px-3 py-2.5 rounded-md border border-ink/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-md bg-teal text-white text-sm font-medium hover:bg-teal-light transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="mt-4 text-[11px] text-slate-muted text-center">
          No backend running yet? This form falls back to a local dev session
          so you can click through the app.
        </p>
      </form>
    </div>
  );
}

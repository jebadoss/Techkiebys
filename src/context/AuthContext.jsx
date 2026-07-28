import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [attendant, setAttendant] = useState(() => {
    const saved = localStorage.getItem('trackwheel_attendant');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (username, password) => {
    // Falls back to a mock session if the backend isn't running yet,
    // so the frontend is fully clickable during development.
    try {
      const { data } = await authApi.login(username, password);
      localStorage.setItem('trackwheel_token', data.token);
      
      const attendantData = { name: username, gate: 'Gate 1' };
      localStorage.setItem('trackwheel_attendant', JSON.stringify(attendantData));
      setAttendant(attendantData);
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed: ' + (err.response?.data?.message || err.message));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('trackwheel_token');
    localStorage.removeItem('trackwheel_attendant');
    setAttendant(null);
  }, []);

  return (
    <AuthContext.Provider value={{ attendant, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

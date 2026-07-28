import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Entry from './pages/Entry';
import Exit from './pages/Exit';
import History from './pages/History';
import Shift from './pages/Shift';

function ProtectedLayout({ children }) {
  const { attendant } = useAuth();
  if (!attendant) return <Navigate to="/login" replace />;
  return (
    <div className="flex bg-paper min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/entry" element={<ProtectedLayout><Entry /></ProtectedLayout>} />
      <Route path="/exit" element={<ProtectedLayout><Exit /></ProtectedLayout>} />
      <Route path="/history" element={<ProtectedLayout><History /></ProtectedLayout>} />
      <Route path="/shift" element={<ProtectedLayout><Shift /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

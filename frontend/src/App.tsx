import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Reports } from './pages/Reports';
import './App.css';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const savedUser = localStorage.getItem('sweety_user');
    const token = localStorage.getItem('sweety_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('sweety_user');
        localStorage.removeItem('sweety_token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sweety_token');
    localStorage.removeItem('sweety_user');
    setUser(null);
  };

  if (loading) {
    return <div className="app-loading">Loading Sweety...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        {user && <Navbar userName={user.name} onLogout={handleLogout} />}

        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                user ? <Navigate to="/" replace /> : <Login onLoginSuccess={(u) => setUser(u)} />
              }
            />
            <Route
              path="/register"
              element={
                user ? <Navigate to="/" replace /> : <Register onRegisterSuccess={(u) => setUser(u)} />
              }
            />
            <Route
              path="/"
              element={user ? <Dashboard /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/reports"
              element={user ? <Reports /> : <Navigate to="/login" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;

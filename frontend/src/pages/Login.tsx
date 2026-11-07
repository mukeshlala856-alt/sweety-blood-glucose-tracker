import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { User } from '../types';
import { AlertBanner } from '../components/AlertBanner';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('sweety_token', res.data.token);
      localStorage.setItem('sweety_user', JSON.stringify(res.data.user));

      onLoginSuccess(res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setEmail('demo@sweety.com');
    setPassword('Sweety@123');
  };

  return (
    <div className="auth-box">
      <h2 style={{ textAlign: 'center', marginBottom: 5 }}>Sweety</h2>
      <p style={{ textAlign: 'center', color: '#666', marginTop: 0, marginBottom: 20 }}>
        Blood Glucose Tracker
      </p>

      <AlertBanner type="error" message={error} />

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 10 }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>

        <button
          type="button"
          onClick={handleDemo}
          className="btn btn-secondary"
          style={{ width: '100%', marginBottom: 15 }}
        >
          Fill Demo User (demo@sweety.com)
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
};

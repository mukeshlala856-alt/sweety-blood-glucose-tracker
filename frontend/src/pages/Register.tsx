import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { User } from '../types';
import { AlertBanner } from '../components/AlertBanner';

interface RegisterProps {
  onRegisterSuccess: (user: User) => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('sweety_token', res.data.token);
      localStorage.setItem('sweety_user', JSON.stringify(res.data.user));

      onRegisterSuccess(res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      <h2 style={{ textAlign: 'center', marginBottom: 5 }}>Create Account</h2>
      <p style={{ textAlign: 'center', color: '#666', marginTop: 0, marginBottom: 20 }}>
        Join Sweety Blood Glucose Tracker
      </p>

      <AlertBanner type="error" message={error} />

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            style={{ width: '100%', boxSizing: 'border-box' }}
            required
          />
        </div>

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
          style={{ width: '100%', marginBottom: 15 }}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login">Sign in here</Link>
      </div>
    </div>
  );
};

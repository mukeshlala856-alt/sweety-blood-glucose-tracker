import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AlertBanner } from '../components/AlertBanner';
import type { User } from '../types';

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

    if (!name || !email || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', { name, email, password });
      const { token, user } = res.data;

      localStorage.setItem('sweety_token', token);
      localStorage.setItem('sweety_user', JSON.stringify(user));

      onRegisterSuccess(user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🩸</div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join Sweety to manage your daily blood sugar</p>
        </div>

        {error && <AlertBanner type="error" message={error} />}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="regName">Full Name</label>
            <input
              id="regName"
              type="text"
              placeholder="e.g. Mukesh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="regEmail">Email Address</label>
            <input
              id="regEmail"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="regPassword">Password</label>
            <input
              id="regPassword"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

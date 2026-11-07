import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  userName?: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <span className="brand-icon">🩸</span>
            <span className="brand-text">Sweety</span>
          </Link>
          <span className="brand-badge">Glucose Tracker</span>
        </div>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/reports"
            className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
          >
            Reports
          </Link>
        </div>

        <div className="navbar-user">
          {userName && <span className="user-greeting">Hello, <strong>{userName}</strong></span>}
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

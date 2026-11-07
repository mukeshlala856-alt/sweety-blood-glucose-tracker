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
      <Link to="/" className="navbar-brand">
        🍯 Sweety Glucose Tracker
      </Link>

      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>
          Reports
        </Link>
        <button onClick={handleLogout} className="btn-danger" style={{ marginLeft: 15 }}>
          Logout ({userName || 'User'})
        </button>
      </div>
    </nav>
  );
};

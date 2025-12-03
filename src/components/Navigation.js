// src/components/Navigation.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // Don't show navigation when not logged in
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="nav-logo-icon">⚡</div>
          <h1 className="nav-logo">Malan XAS Scrap Metals</h1>
        </div>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <span className="nav-icon">📝</span>
              <span className="nav-text">Daily Record</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/history" 
              className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">History</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Dashboard</span>
            </Link>
          </li>
          <li className="nav-item user-menu">
            <div className="user-info">
              <span className="user-avatar">🙍‍♂️</span>
              <span className="username">{user.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="logout-btn"
              title="Logout"
            >
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
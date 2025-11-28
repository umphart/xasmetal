// src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">Scrap Management</h1>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Daily Record
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/history" 
              className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`}
            >
              History
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
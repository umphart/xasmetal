// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    // Check if admin exists and show appropriate message
    const checkAdmin = async () => {
      try {
        const response = await authService.checkAdminExists();
        if (!response.data.hasAdmin) {
          setInfo('No admin account found. Please register first.');
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        // Continue with login form
      }
    };

    checkAdmin();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.username.trim() || !formData.password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.login(formData.username, formData.password);
      
      if (result.success) {
        console.log('Login successful, user:', result.data.user);
        // Store token
        authService.setToken(result.data.token);
        // Login to context
        login(result.data.user, result.data.token);
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>MAL XAS Login</h2>
        
        {info && <div className="info-message">{info}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          <p>Don't have an account? </p>
          <button 
            type="button" 
            className="switch-button"
            onClick={() => window.location.href = '/register'}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
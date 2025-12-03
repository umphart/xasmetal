// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import DailyRecord from './components/DailyRecord';
import History from './components/History';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import ApiService from './services/api';
import authService from './services/auth';
import { normalizeRecord, normalizeRecords } from './utils/dataHelpers';
import './App.css';
import './responsive.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Public Route component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

function AppContent() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load records from backend on component mount or when user changes
  useEffect(() => {
    if (user) {
      loadRecords();
    } else {
      setRecords([]);
      setLoading(false);
    }
  }, [user]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getRecords();
      const normalizedRecords = normalizeRecords(response.data);
      setRecords(normalizedRecords);
      setError(null);
    } catch (err) {
      console.error('Error loading records:', err);
      setError('Failed to load records. Using local storage as fallback.');
      // Fallback to localStorage
      const savedRecords = localStorage.getItem('scrapRecords');
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords);
        const normalizedRecords = normalizeRecords(parsedRecords);
        setRecords(normalizedRecords);
      } else {
        setRecords([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (newRecord) => {
    try {
      console.log('App.js: Received newRecord:', newRecord); // Debug log
      
      // Prepare data for backend - USE SNAKE_CASE FROM RecordForm
      const recordData = {
        item_name: newRecord.item_name || newRecord.itemName, // Handle both formats
        weight: parseFloat(newRecord.weight),
        supplier_name: newRecord.supplier_name || newRecord.supplierName, // Handle both formats
        transaction_date: newRecord.transaction_date || newRecord.transactionDate // Handle both formats
      };

      // Handle item-specific fields
      if (recordData.item_name === 'Pot') {
        // For Pot, use amount field
        recordData.amount = parseFloat(newRecord.amount) || 0;
        recordData.price_per_kg = 0; // Set to 0 for Pot
      } else {
        // For other items, use price per kg
        recordData.price_per_kg = parseFloat(newRecord.price_per_kg || newRecord.pricePerKg || 0);
        recordData.amount = 0; // Set to 0 for non-Pot items
      }

      // Calculate total amount
      if (recordData.item_name === 'Pot') {
        recordData.total_amount = recordData.amount;
      } else {
        recordData.total_amount = recordData.weight * recordData.price_per_kg;
      }

      console.log('App.js: Sending to backend:', recordData); // Debug log

      const response = await ApiService.createRecord(recordData);
      
      // Normalize the response before adding to state
      const normalizedRecord = normalizeRecord({
        ...response.data,
        transaction_date: recordData.transaction_date // Ensure transaction date is preserved
      });
      setRecords(prev => [...prev, normalizedRecord]);

      return response.data;
    } catch (err) {
      console.error('Error creating record:', err);
      
      // Fallback to localStorage
      const recordWithId = {
        ...newRecord,
        id: Date.now().toString(),
        timestamp: newRecord.transaction_date || newRecord.transactionDate ? 
          `${(newRecord.transaction_date || newRecord.transactionDate)}T00:00:00.000Z` :
          new Date().toISOString()
      };
      const normalizedRecord = normalizeRecord(recordWithId);
      
      setRecords(prev => [...prev, normalizedRecord]);
      
      // Update localStorage with normalized records
      const updatedRecords = [...records, normalizedRecord];
      localStorage.setItem('scrapRecords', JSON.stringify(updatedRecords));
      
      throw err;
    }
  };

  const deleteRecord = async (id) => {
    try {
      await ApiService.deleteRecord(id);
      setRecords(prev => prev.filter(record => record.id !== id));
      
      // Update localStorage
      const updatedRecords = records.filter(record => record.id !== id);
      localStorage.setItem('scrapRecords', JSON.stringify(updatedRecords));
    } catch (err) {
      console.error('Error deleting record:', err);
      // Fallback to local state update only
      setRecords(prev => prev.filter(record => record.id !== id));
      
      // Update localStorage
      const updatedRecords = records.filter(record => record.id !== id);
      localStorage.setItem('scrapRecords', JSON.stringify(updatedRecords));
    }
  };

  if (loading && user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading records...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Navigation />
      <div className="container">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DailyRecord onAddRecord={addRecord} />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History records={records} onDeleteRecord={deleteRecord} />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard records={records} />
            </ProtectedRoute>
          } />
          
          {/* Redirect to home for unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
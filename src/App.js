// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import DailyRecord from './components/DailyRecord';
import History from './components/History';
import Dashboard from './components/Dashboard';
import './App.css';
import './styles/App.css';
import './styles/responsive.css'
function App() {
  const [records, setRecords] = useState([]);

  // Load records from localStorage on component mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('scrapRecords');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
  }, []);

  // Save records to localStorage whenever records change
  useEffect(() => {
    localStorage.setItem('scrapRecords', JSON.stringify(records));
  }, [records]);

  const addRecord = (newRecord) => {
    const recordWithId = {
      ...newRecord,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setRecords(prev => [...prev, recordWithId]);
  };

  const deleteRecord = (id) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container">
          <Routes>
            <Route path="/" element={<DailyRecord onAddRecord={addRecord} />} />
            <Route path="/history" element={<History records={records} onDeleteRecord={deleteRecord} />} />
            <Route path="/dashboard" element={<Dashboard records={records} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
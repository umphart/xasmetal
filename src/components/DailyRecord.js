// src/components/DailyRecord.js
import React, { useState, useEffect } from 'react';
import RecordForm from './RecordForm';

const DailyRecord = ({ onAddRecord }) => {
  const [todayRecords, setTodayRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const saved = localStorage.getItem('scrapRecords');
    if (saved) {
      const allRecords = JSON.parse(saved);
      const today = allRecords.filter(record => 
        record.timestamp.startsWith(selectedDate)
      );
      setTodayRecords(today);
    }
  }, [selectedDate]);

  const handleAddRecord = (record) => {
    onAddRecord(record);
    setTodayRecords(prev => [...prev, {
      ...record,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }]);
  };

  const getTotalForToday = () => {
    return todayRecords.reduce((total, record) => total + record.totalAmount, 0);
  };

  return (
    <div className="daily-record">
      <div className="page-header">
        <h2>Daily Record - {new Date(selectedDate).toLocaleDateString()}</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-selector"
        />
      </div>

      <RecordForm onSubmit={handleAddRecord} />

      <div className="today-summary">
        <h3>Today's Summary</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <span className="card-label">Total Transactions</span>
            <span className="card-value">{todayRecords.length}</span>
          </div>
          <div className="summary-card">
            <span className="card-label">Total Amount</span>
            <span className="card-value">₦{getTotalForToday().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="today-records">
        <h3>Today's Transactions</h3>
        {todayRecords.length === 0 ? (
          <p className="no-records">No records for today</p>
        ) : (
          <div className="records-table">
            <div className="table-header">
              <span>Item</span>
              <span>Weight (kg)</span>
              <span>Price/kg</span>
              <span>Total</span>
              <span>Supplier</span>
            </div>
            {todayRecords.map(record => (
              <div key={record.id} className="table-row">
                <span data-label="Item">{record.itemName}</span>
                <span data-label="Weight">{record.weight} kg</span>
                <span data-label="Price/kg">₦{record.pricePerKg}</span>
                <span data-label="Total">₦{record.totalAmount.toFixed(2)}</span>
                <span data-label="Supplier">{record.supplierName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRecord;
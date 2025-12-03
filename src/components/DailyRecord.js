// src/components/DailyRecord.js
import React, { useState, useEffect } from 'react';
import RecordForm from './RecordForm';
import { formatCurrency, formatNumber } from '../utils/dataHelpers';

const DailyRecord = ({ onAddRecord }) => {
  const [todayRecords, setTodayRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const saved = localStorage.getItem('scrapRecords');
    if (saved) {
      const allRecords = JSON.parse(saved);
      const today = allRecords.filter(record => {
        const recordDate = record.timestamp || record.created_at || record.transaction_date;
        // Extract just the date part for comparison
        const recordDateOnly = recordDate.split('T')[0];
        return recordDateOnly === selectedDate;
      });
      setTodayRecords(today);
    }
  }, [selectedDate]);

  const handleAddRecord = (record) => {
    onAddRecord(record);
    // Add to today's view only if the date matches
    if (record.transactionDate === selectedDate) {
      setTodayRecords(prev => [...prev, {
        ...record,
        id: Date.now().toString(),
        timestamp: record.transactionDate ? 
          `${record.transactionDate}T00:00:00.000Z` : 
          new Date().toISOString()
      }]);
    }
  };

  const getTotalForToday = () => {
    return todayRecords.reduce((total, record) => {
      const amount = parseFloat(record.totalAmount || record.total_amount) || 0;
      return total + amount;
    }, 0);
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
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <RecordForm onSubmit={handleAddRecord} />

      <div className="today-summary">
        <h3>Summary for {new Date(selectedDate).toLocaleDateString()}</h3>
        <div className="summary-cards">
          <div className="summary-card">
            <span className="card-label">Total Transactions</span>
            <span className="card-value">{todayRecords.length}</span>
          </div>
          <div className="summary-card">
            <span className="card-label">Total Amount</span>
            <span className="card-value">{formatCurrency(getTotalForToday())}</span>
          </div>
        </div>
      </div>

      <div className="today-records">
        <h3>Transactions for {new Date(selectedDate).toLocaleDateString()}</h3>
        {todayRecords.length === 0 ? (
          <p className="no-records">No records for this date</p>
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
                <span data-label="Item">{record.itemName || record.item_name}</span>
                <span data-label="Weight">{formatNumber(record.weight)} kg</span>
                <span data-label="Price/kg">{formatCurrency(record.pricePerKg || record.price_per_kg)}</span>
                <span data-label="Total">{formatCurrency(record.totalAmount || record.total_amount)}</span>
                <span data-label="Supplier">{record.supplierName || record.supplier_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRecord;
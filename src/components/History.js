// src/components/History.js
import React, { useState, useMemo } from 'react';

const History = ({ records, onDeleteRecord }) => {
  const [filters, setFilters] = useState({
    itemName: '',
    supplierName: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('date-desc');

  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Apply filters
    if (filters.itemName) {
      filtered = filtered.filter(record => 
        record.itemName.toLowerCase().includes(filters.itemName.toLowerCase())
      );
    }

    if (filters.supplierName) {
      filtered = filtered.filter(record => 
        record.supplierName.toLowerCase().includes(filters.supplierName.toLowerCase())
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(record => 
        record.timestamp >= filters.startDate
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(record => 
        record.timestamp.split('T')[0] <= filters.endDate
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'date-desc':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'amount-asc':
          return a.totalAmount - b.totalAmount;
        case 'amount-desc':
          return b.totalAmount - a.totalAmount;
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    return filtered;
  }, [records, filters, sortBy]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      itemName: '',
      supplierName: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="history">
      <div className="page-header">
        <h2>Transaction History</h2>
        <span className="total-count">Total: {filteredRecords.length} records</span>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Item Name</label>
            <input
              type="text"
              name="itemName"
              value={filters.itemName}
              onChange={handleFilterChange}
              placeholder="Filter by item..."
            />
          </div>

          <div className="filter-group">
            <label>Supplier Name</label>
            <input
              type="text"
              name="supplierName"
              value={filters.supplierName}
              onChange={handleFilterChange}
              placeholder="Filter by supplier..."
            />
          </div>

          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      <div className="records-table-container">
        {filteredRecords.length === 0 ? (
          <p className="no-records">No records found</p>
        ) : (
          <div className="records-table">
            <div className="table-header">
              <span>Date & Time</span>
              <span>Item</span>
              <span>Weight (kg)</span>
              <span>Price/kg</span>
              <span>Total</span>
              <span>Supplier</span>
              <span>Actions</span>
            </div>
            {filteredRecords.map(record => (
              <div key={record.id} className="table-row">
                <span data-label="Date & Time">{new Date(record.timestamp).toLocaleString()}</span>
                <span data-label="Item" className="item-badge">{record.itemName}</span>
                <span data-label="Weight">{record.weight} kg</span>
                <span data-label="Price/kg">₦{record.pricePerKg}</span>
                <span data-label="Total" className="amount">₦{record.totalAmount.toFixed(2)}</span>
                <span data-label="Supplier">{record.supplierName}</span>
                <span data-label="Actions">
                  <button 
                    onClick={() => onDeleteRecord(record.id)}
                    className="delete-btn"
                    title="Delete record"
                  >
                    🗑️
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
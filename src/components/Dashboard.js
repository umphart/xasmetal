// src/components/Dashboard.js
import React, { useMemo } from 'react';

const Dashboard = ({ records }) => {
  console.log('Dashboard records:', records);
  const dashboardData = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        totalWeight: 0,
        totalAmount: 0,
        itemStats: {},
        supplierStats: {},
        recentTransactions: []
      };
    }

    // Ensure we're working with numbers
    const totalWeight = records.reduce((sum, record) => {
      const weight = parseFloat(record.weight) || 0;
      return sum + weight;
    }, 0);

    const totalAmount = records.reduce((sum, record) => {
      const amount = parseFloat(record.totalAmount) || 0;
      return sum + amount;
    }, 0);

    const itemStats = records.reduce((stats, record) => {
      const item = record.itemName;
      if (!stats[item]) {
        stats[item] = { totalWeight: 0, totalAmount: 0, count: 0 };
      }
      const weight = parseFloat(record.weight) || 0;
      const amount = parseFloat(record.totalAmount) || 0;
      stats[item].totalWeight += weight;
      stats[item].totalAmount += amount;
      stats[item].count += 1;
      return stats;
    }, {});

    const supplierStats = records.reduce((stats, record) => {
      const supplier = record.supplierName;
      if (!stats[supplier]) {
        stats[supplier] = { totalAmount: 0, count: 0 };
      }
      const amount = parseFloat(record.totalAmount) || 0;
      stats[supplier].totalAmount += amount;
      stats[supplier].count += 1;
      return stats;
    }, {});

    // Safe date sorting and filtering
    const recentTransactions = records
      .map(record => {
        // Extract and validate date
        const dateString = record.timestamp || record.created_at || record.transaction_date;
        const date = new Date(dateString);
        
        return {
          ...record,
          sortDate: isNaN(date.getTime()) ? new Date(0) : date, // Use epoch if invalid
          isValidDate: !isNaN(date.getTime())
        };
      })
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 5)
      .map(record => {
        // Remove temporary properties
        const { sortDate, isValidDate, ...cleanRecord } = record;
        return cleanRecord;
      });

    return {
      totalWeight,
      totalAmount,
      itemStats,
      supplierStats,
      recentTransactions
    };
  }, [records]);

// Safe date formatting function - SHOW DATE ONLY
const formatDate = (record) => {
  const dateString = record.displayDate; // Use displayDate directly
  
  if (!dateString) {
    return 'No date';
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleDateString();
};

  // Safe number formatting function
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) {
      return '0.00';
    }
    return num.toFixed(2);
  };

  const formatCurrency = (amount) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `₦${num.toFixed(2)}`;
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Dashboard Overview</h2>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card large">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <span className="card-label">Total Amount</span>
            <span className="card-value">{formatCurrency(dashboardData.totalAmount)}</span>
          </div>
        </div>

        <div className="summary-card large">
          <div className="card-icon">⚖️</div>
          <div className="card-content">
            <span className="card-label">Total Weight</span>
            <span className="card-value">{formatNumber(dashboardData.totalWeight)} kg</span>
          </div>
        </div>

        <div className="summary-card large">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <span className="card-label">Total Transactions</span>
            <span className="card-value">{records.length}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Item Statistics */}
        <div className="dashboard-section">
          <h3>Item Statistics</h3>
          {Object.keys(dashboardData.itemStats).length === 0 ? (
            <p className="no-records">No item statistics available</p>
          ) : (
            <div className="stats-table">
              <div className="table-header">
                <span>Item</span>
                <span>Total Weight</span>
                <span>Total Amount</span>
                <span>Transactions</span>
              </div>
              {Object.entries(dashboardData.itemStats).map(([item, stats]) => (
                <div key={item} className="table-row">
                  <span data-label="Item" className="item-badge">{item}</span>
                  <span data-label="Total Weight">{formatNumber(stats.totalWeight)} kg</span>
                  <span data-label="Total Amount">{formatCurrency(stats.totalAmount)}</span>
                  <span data-label="Transactions">{stats.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Supplier Statistics */}
        <div className="dashboard-section">
          <h3>Supplier Statistics</h3>
          {Object.keys(dashboardData.supplierStats).length === 0 ? (
            <p className="no-records">No supplier statistics available</p>
          ) : (
            <div className="stats-table">
              <div className="table-header">
                <span>Supplier</span>
                <span>Total Amount</span>
                <span>Transactions</span>
              </div>
              {Object.entries(dashboardData.supplierStats)
                .sort((a, b) => b[1].totalAmount - a[1].totalAmount)
                .map(([supplier, stats]) => (
                  <div key={supplier} className="table-row">
                    <span data-label="Supplier">{supplier}</span>
                    <span data-label="Total Amount">{formatCurrency(stats.totalAmount)}</span>
                    <span data-label="Transactions">{stats.count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

<div className="dashboard-section full-width">
  <h3>Recent Transactions</h3>
  {dashboardData.recentTransactions.length === 0 ? (
    <p className="no-records">No recent transactions</p>
  ) : (
    <div className="records-table">
      <div className="table-header">
        <span>Date</span> {/* Changed from "Date & Time" to "Date" */}
        <span>Item</span>
        <span>Weight</span>
        <span>Total Amount</span>
        <span>Supplier</span>
      </div>
      {dashboardData.recentTransactions.map(record => (
        <div key={record.id} className="table-row">
          <span data-label="Date"> {/* Changed data-label to "Date" */}
            {formatDate(record)}
          </span>
          <span data-label="Item" className="item-badge">{record.itemName || record.item_name}</span>
          <span data-label="Weight">{formatNumber(record.weight)} kg</span>
          <span data-label="Total Amount" className="amount">
            {formatCurrency(record.totalAmount || record.total_amount)}
          </span>
          <span data-label="Supplier">{record.supplierName || record.supplier_name}</span>
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
};

export default Dashboard;
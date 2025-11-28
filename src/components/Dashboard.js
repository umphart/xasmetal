// src/components/Dashboard.js
import React, { useMemo } from 'react';

const Dashboard = ({ records }) => {
  const dashboardData = useMemo(() => {
    if (records.length === 0) {
      return {
        totalWeight: 0,
        totalAmount: 0,
        itemStats: {},
        supplierStats: {},
        recentTransactions: []
      };
    }

    const totalWeight = records.reduce((sum, record) => sum + record.weight, 0);
    const totalAmount = records.reduce((sum, record) => sum + record.totalAmount, 0);

    const itemStats = records.reduce((stats, record) => {
      const item = record.itemName;
      if (!stats[item]) {
        stats[item] = { totalWeight: 0, totalAmount: 0, count: 0 };
      }
      stats[item].totalWeight += record.weight;
      stats[item].totalAmount += record.totalAmount;
      stats[item].count += 1;
      return stats;
    }, {});

    const supplierStats = records.reduce((stats, record) => {
      const supplier = record.supplierName;
      if (!stats[supplier]) {
        stats[supplier] = { totalAmount: 0, count: 0 };
      }
      stats[supplier].totalAmount += record.totalAmount;
      stats[supplier].count += 1;
      return stats;
    }, {});

    const recentTransactions = records
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    return {
      totalWeight,
      totalAmount,
      itemStats,
      supplierStats,
      recentTransactions
    };
  }, [records]);

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
            <span className="card-value">₦{dashboardData.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="summary-card large">
          <div className="card-icon">⚖️</div>
          <div className="card-content">
            <span className="card-label">Total Weight</span>
            <span className="card-value">{dashboardData.totalWeight.toFixed(2)} kg</span>
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
                <span data-label="Total Weight">{stats.totalWeight.toFixed(2)} kg</span>
                <span data-label="Total Amount">₦{stats.totalAmount.toFixed(2)}</span>
                <span data-label="Transactions">{stats.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Statistics */}
        <div className="dashboard-section">
          <h3>Supplier Statistics</h3>
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
                  <span data-label="Total Amount">₦{stats.totalAmount.toFixed(2)}</span>
                  <span data-label="Transactions">{stats.count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="dashboard-section full-width">
        <h3>Recent Transactions</h3>
        {dashboardData.recentTransactions.length === 0 ? (
          <p className="no-records">No recent transactions</p>
        ) : (
          <div className="records-table">
            <div className="table-header">
              <span>Date & Time</span>
              <span>Item</span>
              <span>Weight</span>
              <span>Total Amount</span>
              <span>Supplier</span>
            </div>
            {dashboardData.recentTransactions.map(record => (
              <div key={record.id} className="table-row">
                <span data-label="Date & Time">{new Date(record.timestamp).toLocaleString()}</span>
                <span data-label="Item" className="item-badge">{record.itemName}</span>
                <span data-label="Weight">{record.weight} kg</span>
                <span data-label="Total Amount" className="amount">₦{record.totalAmount.toFixed(2)}</span>
                <span data-label="Supplier">{record.supplierName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
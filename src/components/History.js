// src/components/History.js
import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { formatCurrency, formatNumber } from '../utils/dataHelpers'; // Remove formatDateTime, formatDisplayDate imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrashAlt, 
  faFilter, 
  faSortAmountDown, 
  faSortAmountUp,
  faCalendarAlt,
  faCalendarPlus,
  faFileExport,
  faDatabase,
  faTimesCircle,
  faDownload,
  faRedo,
  faEye,
  faClock
} from '@fortawesome/free-solid-svg-icons';

const History = ({ records, onDeleteRecord }) => {
  console.log('History records raw:', records);
  const [filters, setFilters] = useState({
    itemName: '',
    supplierName: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('date-desc');
  const [dateDisplayMode, setDateDisplayMode] = useState('transaction'); // 'transaction' or 'created'

  // Helper function to get valid date - MOVED BEFORE useMemo
  const getValidDate = (record) => {
    const dateSources = [
      record.displayDate,
      record.transactionDate,
      record.createdAt,
      record.timestamp,
      record.created_at,
      record.transaction_date
    ];

    console.log('getValidDate called with record:', record);
    console.log('Date sources:', dateSources);

    for (const dateString of dateSources) {
      if (!dateString) {
        console.log('Skipping empty date string');
        continue;
      }
      
      let cleanDateString = dateString;
      if (dateString.includes('ZT')) {
        console.log('Found malformed date, fixing:', dateString);
        cleanDateString = dateString.split('ZT')[0] + 'Z';
      }
      
      console.log('Attempting to parse date:', cleanDateString);
      const date = new Date(cleanDateString);
      
      if (!isNaN(date.getTime())) {
        console.log('Valid date found:', date);
        return date;
      } else {
        console.log('Invalid date:', cleanDateString);
      }
    }
    
    console.log('No valid date found, returning current date');
    return new Date();
  };

  // Helper function for date formatting in filters - MOVED BEFORE useMemo
  const formatDateForFilter = (record) => {
    const date = getValidDate(record);
    return date.toISOString().split('T')[0];
  };

  // Custom date formatting functions
  const formatDisplayDate = (record) => {
    const date = getValidDate(record);
    console.log('formatDisplayDate - record:', record, 'date:', date);
    return date.toLocaleDateString();
  };

  const formatDateTime = (record) => {
    const date = getValidDate(record);
    console.log('formatDateTime - record:', record, 'date:', date);
    
    // If it's a transaction date (displayDate), show just date
    if (record.displayDate && !record.createdAt && !record.created_at) {
      return date.toLocaleDateString();
    }
    // Otherwise show full date and time for creation dates
    return date.toLocaleString();
  };

  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    console.log('Starting filter with records:', filtered.length);

    // Apply filters
    if (filters.itemName) {
      filtered = filtered.filter(record => 
        (record.itemName || record.item_name || '').toLowerCase().includes(filters.itemName.toLowerCase())
      );
    }

    if (filters.supplierName) {
      filtered = filtered.filter(record => 
        (record.supplierName || record.supplier_name || '').toLowerCase().includes(filters.supplierName.toLowerCase())
      );
    }

    if (filters.startDate) {
      filtered = filtered.filter(record => {
        const recordDate = formatDateForFilter(record);
        console.log('Start date filter - recordDate:', recordDate, 'startDate:', filters.startDate);
        return recordDate >= filters.startDate;
      });
    }

    if (filters.endDate) {
      filtered = filtered.filter(record => {
        const recordDate = formatDateForFilter(record);
        console.log('End date filter - recordDate:', recordDate, 'endDate:', filters.endDate);
        return recordDate <= filters.endDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = getValidDate(a);
      const dateB = getValidDate(b);
      const amountA = parseFloat(a.totalAmount || a.total_amount) || 0;
      const amountB = parseFloat(b.totalAmount || b.total_amount) || 0;

      switch (sortBy) {
        case 'date-asc':
          return dateA - dateB;
        case 'date-desc':
          return dateB - dateA;
        case 'amount-asc':
          return amountA - amountB;
        case 'amount-desc':
          return amountB - amountA;
        default:
          return dateB - dateA;
      }
    });

    console.log('Filtered records:', filtered);
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

  const getDateDisplay = (record) => {
    console.log('getDateDisplay called with record:', record);
    console.log('dateDisplayMode:', dateDisplayMode);
    
    if (dateDisplayMode === 'transaction') {
      const result = formatDisplayDate(record);
      console.log('Transaction date result:', result);
      return result;
    } else {
      const result = formatDateTime(record);
      console.log('Created date result:', result);
      return result;
    }
  };

  // Delete confirmation with SweetAlert
  const handleDeleteRecord = async (record) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will delete the ${record.itemName || record.item_name} record. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    });

    if (result.isConfirmed) {
      try {
        await onDeleteRecord(record.id);
        Swal.fire({
          title: 'Deleted!',
          text: 'The record has been deleted successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the record. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  // Export to CSV function
  const exportToCSV = (dataToExport) => {
    if (dataToExport.length === 0) {
      Swal.fire({
        title: 'No Data',
        text: 'There are no records to export.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Define CSV headers
    const headers = [
      'Transaction Date',
      'Item',
      'Weight (kg)',
      'Price per kg (₦)',
      'Total Amount (₦)',
      'Supplier',
      'Created Date'
    ];

    // Convert records to CSV rows
    const csvRows = dataToExport.map(record => {
      const transactionDate = getValidDate(record).toLocaleDateString();
      const createdDate = record.createdAt ? 
        new Date(record.createdAt).toLocaleString() : 
        transactionDate;
      
      return [
        `"${transactionDate}"`,
        `"${record.itemName || record.item_name}"`,
        `"${formatNumber(record.weight)}"`,
        `"${formatCurrency(record.pricePerKg || record.price_per_kg).replace('₦', '')}"`,
        `"${formatCurrency(record.totalAmount || record.total_amount).replace('₦', '')}"`,
        `"${record.supplierName || record.supplier_name}"`,
        `"${createdDate}"`
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `scrap-records-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    Swal.fire({
      title: 'Export Successful!',
      text: `Exported ${dataToExport.length} records to CSV file.`,
      icon: 'success',
      timer: 3000,
      showConfirmButton: false
    });
  };

  // Export filtered data only
  const exportFilteredToCSV = () => {
    exportToCSV(filteredRecords);
  };

  // Export all data
  const exportAllToCSV = () => {
    exportToCSV(records);
  };

  return (
    <div className="history">
      <div className="page-header">
        <div className="page-header-left">
          <h2>
            <FontAwesomeIcon icon={faCalendarAlt} className="header-icon" />
            Transaction History
          </h2>
          <span className="total-count">
            <FontAwesomeIcon icon={faDatabase} className="count-icon" />
            Total: {filteredRecords.length} records
          </span>
        </div>
        <div className="export-buttons">
          <button 
            onClick={exportFilteredToCSV}
            className="export-btn"
            disabled={filteredRecords.length === 0}
            title="Export filtered data to CSV"
          >
            <FontAwesomeIcon icon={faFileExport} className="export-icon" />
            Export Filtered ({filteredRecords.length})
          </button>
          <button 
            onClick={exportAllToCSV}
            className="export-btn export-all-btn"
            disabled={records.length === 0}
            title="Export all data to CSV"
          >
            <FontAwesomeIcon icon={faDownload} className="export-icon" />
            Export All ({records.length})
          </button>
        </div>
      </div>

      <div className="filters-section">
        <h3>
          <FontAwesomeIcon icon={faFilter} className="section-icon" />
          Filters & Display
        </h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>
              <FontAwesomeIcon icon={faEye} className="filter-icon" />
              Item Name
            </label>
            <input
              type="text"
              name="itemName"
              value={filters.itemName}
              onChange={handleFilterChange}
              placeholder="Filter by item..."
            />
          </div>

          <div className="filter-group">
            <label>
              <FontAwesomeIcon icon={faEye} className="filter-icon" />
              Supplier Name
            </label>
            <input
              type="text"
              name="supplierName"
              value={filters.supplierName}
              onChange={handleFilterChange}
              placeholder="Filter by supplier..."
            />
          </div>

          <div className="filter-group">
            <label>
              <FontAwesomeIcon icon={faCalendarPlus} className="filter-icon" />
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="filter-group">
            <label>
              <FontAwesomeIcon icon={faCalendarPlus} className="filter-icon" />
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="filter-actions">
          <div className="display-options">
            <label>
              <FontAwesomeIcon icon={faClock} className="option-icon" />
              Date Display: 
            </label>
            <select 
              value={dateDisplayMode} 
              onChange={(e) => setDateDisplayMode(e.target.value)}
              className="display-select"
            >
              <option value="transaction">Transaction Date</option>
              <option value="created">Created Date & Time</option>
            </select>
          </div>

          <div className="filter-buttons">
            <button onClick={clearFilters} className="clear-filters-btn">
              <FontAwesomeIcon icon={faRedo} className="clear-icon" />
              Clear Filters
            </button>

            <div className="sort-container">
              <FontAwesomeIcon 
                icon={sortBy.includes('desc') ? faSortAmountDown : faSortAmountUp} 
                className="sort-icon" 
              />
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
        </div>
      </div>

      <div className="records-table-container">
        {filteredRecords.length === 0 ? (
          <div className="no-records">
            <FontAwesomeIcon icon={faTimesCircle} className="no-records-icon" />
            <p>No records found</p>
          </div>
        ) : (
          <div className="records-table">
            <div className="table-header">
              <span>
                <FontAwesomeIcon icon={dateDisplayMode === 'transaction' ? faCalendarAlt : faClock} />
                {dateDisplayMode === 'transaction' ? ' Transaction Date' : ' Date & Time'}
              </span>
              <span>Item</span>
              <span>Weight (kg)</span>
              <span>Price/kg</span>
              <span>Total</span>
              <span>Supplier</span>
              <span>Actions</span>
            </div>
            {filteredRecords.map(record => (
              <div key={record.id} className="table-row">
                <span data-label={dateDisplayMode === 'transaction' ? 'Transaction' : 'Date & Time'}>
                  {getDateDisplay(record)}
                </span>
                <span data-label="Item" className="item-badge">
                  {record.itemName || record.item_name}
                </span>
                <span data-label="Weight">
                  {formatNumber(record.weight)} kg
                </span>
                <span data-label="Price/kg">
                  {formatCurrency(record.pricePerKg || record.price_per_kg)}
                </span>
                <span data-label="Total" className="amount">
                  {formatCurrency(record.totalAmount || record.total_amount)}
                </span>
                <span data-label="Supplier">
                  {record.supplierName || record.supplier_name}
                </span>
                <span data-label="Actions">
                  <button 
                    onClick={() => handleDeleteRecord(record)}
                    className="delete-btn"
                    title="Delete record"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} className="delete-icon" />
                    <span className="delete-text"></span>
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
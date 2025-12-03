// src/utils/dataHelpers.js
export const normalizeRecord = (record) => {
  // Handle both camelCase and snake_case input
  const itemName = record.item_name || record.itemName;
  const supplierName = record.supplier_name || record.supplierName;
  const transactionDate = record.transaction_date || record.transactionDate;
  const pricePerKg = record.price_per_kg || record.pricePerKg;
  const amount = record.amount;
  
  return {
    id: record.id || record._id || Date.now().toString(),
    itemName: itemName || '',
    weight: parseFloat(record.weight) || 0,
    pricePerKg: parseFloat(pricePerKg) || 0,
    amount: parseFloat(amount) || 0,
    supplierName: supplierName || '',
    transactionDate: transactionDate || new Date().toISOString().split('T')[0],
    totalAmount: parseFloat(record.total_amount || record.totalAmount) || 0,
    // Preserve the original record for debugging
    _raw: record
  };
};

export const normalizeRecords = (records) => {
  if (!Array.isArray(records)) return [];
  return records.map(normalizeRecord);
};



// Safe number formatting
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00';
  const number = typeof num === 'number' ? num : parseFloat(num);
  return isNaN(number) ? '0.00' : number.toFixed(2);
};

// Safe currency formatting
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₦0.00';
  const number = typeof amount === 'number' ? amount : parseFloat(amount);
  return isNaN(number) ? '₦0.00' : `₦${number.toFixed(2)}`;
};

// Format date for display (show only date without time for transaction dates)
export const formatDisplayDate = (record) => {
  if (record.displayDate) {
    return new Date(record.displayDate).toLocaleDateString();
  }
  return new Date(record.timestamp || record.created_at || record.transaction_date).toLocaleDateString();
};

// Format date with time for detailed view
export const formatDateTime = (record) => {
  if (record.transactionDate && !record.createdAt) {
    // If it's only a transaction date (no creation timestamp), show just the date
    return new Date(record.transactionDate).toLocaleDateString();
  }
  return new Date(record.timestamp || record.created_at || record.transaction_date).toLocaleString();
};

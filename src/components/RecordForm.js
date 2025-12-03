// src/components/RecordForm.js
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { formatCurrency } from '../utils/dataHelpers';

const RecordForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    item_name: '',
    weight: '',
    price_per_kg: '',
    amount: '', // For Pot only
    supplier_name: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPot, setIsPot] = useState(false);

  // Calculate total based on item type
  const calculateTotal = () => {
    if (formData.item_name === 'Pot') {
      return parseFloat(formData.amount) || 0;
    } else {
      const weight = parseFloat(formData.weight) || 0;
      const price = parseFloat(formData.price_per_kg) || 0;
      return weight * price;
    }
  };

  // Handle item selection change
  useEffect(() => {
    const potSelected = formData.item_name === 'Pot';
    setIsPot(potSelected);
    
    if (!potSelected) {
      setFormData(prev => ({ ...prev, amount: '' }));
    } else {
      setFormData(prev => ({ ...prev, price_per_kg: '' }));
    }
  }, [formData.item_name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data before submission:', formData); // Debug
    
    // Basic validation
    if (!formData.item_name || !formData.weight || !formData.supplier_name || !formData.transaction_date) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (isPot && !formData.amount) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter amount for Pot',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    if (!isPot && !formData.price_per_kg) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter price per kg',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for backend - ensure all fields are included
      const recordData = {
        item_name: formData.item_name,
        weight: parseFloat(formData.weight),
        supplier_name: formData.supplier_name,
        transaction_date: formData.transaction_date
      };

      // Add item-specific fields
      if (isPot) {
        recordData.amount = parseFloat(formData.amount);
        recordData.price_per_kg = 0; // Set to 0 for Pot
      } else {
        recordData.price_per_kg = parseFloat(formData.price_per_kg);
        recordData.amount = 0; // Set to 0 for non-Pot items
      }

      // Calculate total amount
      recordData.total_amount = calculateTotal();

      console.log('Sending to backend:', recordData); // Debug log
      
      await onSubmit(recordData);
      
      // Show success alert
      Swal.fire({
        title: 'Success!',
        text: `Record for ${formData.item_name} has been created successfully.`,
        icon: 'success',
        timer: 3000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true,
        background: '#f8f9fa',
        iconColor: '#28a745'
      });

      // Reset form but keep the selected date
      setFormData({
        item_name: '',
        weight: '',
        price_per_kg: '',
        amount: '',
        supplier_name: '',
        transaction_date: formData.transaction_date // Keep the same date
      });
      setIsPot(false);

    } catch (error) {
      console.error('Error creating record:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message || 'Failed to create record. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get yesterday's date for the max date (can't select future dates)
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get a reasonable minimum date (e.g., 1 year ago)
  const getMinDate = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return oneYearAgo.toISOString().split('T')[0];
  };

  // Get preview text based on item type
  const getPreviewText = () => {
    if (!formData.item_name) return 'No item selected';
    
    if (isPot) {
      return `${formData.weight || '0'}kg × ₦${formData.amount ? parseFloat(formData.amount).toFixed(2) : '0.00'} (amount)`;
    } else {
      return `${formData.weight || '0'}kg × ₦${formData.price_per_kg ? parseFloat(formData.price_per_kg).toFixed(2) : '0.00'}/kg`;
    }
  };

  return (
    <div className="record-form">
      <h3>Add New Record</h3>
      <form onSubmit={handleSubmit} className="form">
        {/* First Row - 4 inputs */}
        <div className="form-row-4">
          <div className="form-group">
            <label>Transaction Date</label>
            <input
              type="date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              max={getMaxDate()}
              min={getMinDate()}
              required
              disabled={isSubmitting}
            />
            <small className="date-help">
              Select transaction date
            </small>
          </div>

          <div className="form-group">
            <label>Item Name</label>
            <select 
              name="item_name" 
              value={formData.item_name} 
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select Item</option>
              <option value="Iron">Iron</option>
              <option value="Ceramic">Ceramic</option>
              <option value="Pot">Pot</option>
            </select>
          </div>

          <div className="form-group">
            <label>Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              required
              disabled={isSubmitting}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            {isPot ? (
              <>
                <label>Amount (₦)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  required={isPot}
                  disabled={isSubmitting}
                  placeholder="0.00"
                />
                <small>Total amount for Pot</small>
              </>
            ) : (
              <>
                <label>Price per kg (₦)</label>
                <input
                  type="number"
                  name="price_per_kg"
                  value={formData.price_per_kg}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  required={!isPot}
                  disabled={isSubmitting}
                  placeholder="0.00"
                />
              </>
            )}
          </div>
        </div>

        {/* Second Row - Supplier, Preview, and Button in one row */}
        <div className="form-row-3">
          <div className="form-group supplier-group">
            <label>Supplier Name</label>
            <input
              type="text"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="preview-section">
            <div className="preview-content">
              <div className="preview-line">
                <span className="preview-item">{formData.item_name || 'No item'}</span>
                <span className="preview-separator">•</span>
                <span className="preview-details">{getPreviewText()}</span>
              </div>
              <div className="preview-total">
                {formatCurrency(calculateTotal())}
              </div>
            </div>
          </div>

          <div className="submit-group">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={
                isSubmitting || 
                !formData.item_name || 
                !formData.weight || 
                !formData.supplier_name ||
                (isPot ? !formData.amount : !formData.price_per_kg)
              }
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Creating...
                </>
              ) : (
                'Add Record'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecordForm;
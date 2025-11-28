// src/components/RecordForm.js
import React, { useState } from 'react';

const RecordForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    weight: '',
    pricePerKg: '',
    supplierName: ''
  });

  const calculateTotal = () => {
    const weight = parseFloat(formData.weight) || 0;
    const price = parseFloat(formData.pricePerKg) || 0;
    return weight * price;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.itemName || !formData.weight || !formData.pricePerKg || !formData.supplierName) {
      alert('Please fill in all fields');
      return;
    }

    const record = {
      ...formData,
      weight: parseFloat(formData.weight),
      pricePerKg: parseFloat(formData.pricePerKg),
      totalAmount: calculateTotal()
    };

    onSubmit(record);
    
    // Reset form
    setFormData({
      itemName: '',
      weight: '',
      pricePerKg: '',
      supplierName: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="record-form">
      <h3>Add New Record</h3>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>Item Name</label>
            <select 
              name="itemName" 
              value={formData.itemName} 
              onChange={handleChange}
              required
            >
              <option value="">Select Item</option>
              <option value="iron">Iron</option>
              <option value="ceramic">Ceramic</option>
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
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price per kg (₦)</label>
            <input
              type="number"
              name="pricePerKg"
              value={formData.pricePerKg}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Supplier Name</label>
            <input
              type="text"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-preview">
          <div className="preview-item">
            <strong>Total Amount:</strong> ₦{calculateTotal().toFixed(2)}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Add Record
        </button>
      </form>
    </div>
  );
};

export default RecordForm;
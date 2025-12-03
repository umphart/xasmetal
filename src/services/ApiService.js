// src/services/ApiService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://https://xas-metal.onrender.com/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async request(method, endpoint, data = null) {
    try {
      const response = await this.api.request({
        method,
        url: endpoint,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Validation failed');
    }
  }

  // Create record method
  async createRecord(recordData) {
    console.log('Raw record data:', recordData);
    
    // Check if it's a Brass item
    const isBrass = ['brass', 'Brass', 'BRASS'].includes(recordData.itemName);
    
    // Transform data to match backend expectations
    const formattedData = {
      item_name: recordData.itemName,
      weight: recordData.weight,
      total_amount: recordData.totalAmount,
      supplier_name: recordData.supplierName,
      transaction_date: recordData.transactionDate,
      user_id: 1 // Default user ID - adjust as needed
    };

    // Handle price_per_kg based on item type
    if (isBrass) {
      // For Brass, send null (or exclude the field if backend allows)
      formattedData.price_per_kg = null;
    } else {
      // For other items, include the price
      formattedData.price_per_kg = recordData.pricePerKg || 0;
    }

    console.log('Formatted data for backend:', formattedData);
    
    try {
      const response = await this.request('POST', '/records', formattedData);
      console.log('Backend response:', response);
      return response;
    } catch (error) {
      console.error('Create record error:', error);
      throw error;
    }
  }
}

export default new ApiService();
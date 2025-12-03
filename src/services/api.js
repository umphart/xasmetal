import { supabase } from '../lib/supabase';

class ApiService {
  constructor() {
    this.supabase = supabase;
  }

  // Helper to handle Supabase errors
  handleSupabaseError(error) {
    console.error('Supabase error:', error);
    throw new Error(error.message || 'API request failed');
  }

  // Get records with filters
  async getRecords(filters = {}) {
    try {
      let query = this.supabase
        .from('records')
        .select('*')
        .order('transaction_date', { ascending: false });

      // Apply filters
      if (filters.start_date && filters.end_date) {
        query = query.gte('transaction_date', filters.start_date)
                    .lte('transaction_date', filters.end_date);
      }

      if (filters.item_name) {
        query = query.eq('item_name', filters.item_name);
      }

      if (filters.supplier_name) {
        query = query.ilike('supplier_name', `%${filters.supplier_name}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: data || [],
        message: 'Records fetched successfully'
      };
    } catch (error) {
      return this.handleSupabaseError(error);
    }
  }

  // Create a new record
  async createRecord(recordData) {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .insert([recordData])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Record created successfully'
      };
    } catch (error) {
      return this.handleSupabaseError(error);
    }
  }

  // Get record by ID
  async getRecordById(id) {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Record fetched successfully'
      };
    } catch (error) {
      return this.handleSupabaseError(error);
    }
  }

  // Update record
  async updateRecord(id, recordData) {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .update(recordData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Record updated successfully'
      };
    } catch (error) {
      return this.handleSupabaseError(error);
    }
  }

  // Delete record
  async deleteRecord(id) {
    try {
      const { error } = await this.supabase
        .from('records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Record deleted successfully'
      };
    } catch (error) {
      return this.handleSupabaseError(error);
    }
  }

  // Get dashboard statistics
  async getDashboardStats(filters = {}) {
    try {
      let query = this.supabase.from('records').select('*');

      // Apply date filters
      if (filters.start_date && filters.end_date) {
        query = query.gte('transaction_date', filters.start_date)
                    .lte('transaction_date', filters.end_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total_records: data.length,
        total_weight: data.reduce((sum, record) => sum + (parseFloat(record.weight) || 0), 0),
        total_amount: data.reduce((sum, record) => sum + (parseFloat(record.total_amount) || 0), 0),
        items_by_type: {},
        top_suppliers: {},
        recent_transactions: data.slice(0, 5)
      };

      // Calculate items by type
      data.forEach(record => {
        stats.items_by_type[record.item_name] = (stats.items_by_type[record.item_name] || 0) + 1;
      });

      // Calculate top suppliers
      data.forEach(record => {
        if (record.supplier_name) {
          const amount = parseFloat(record.total_amount) || 0;
          stats.top_suppliers[record.supplier_name] = (stats.top_suppliers[record.supplier_name] || 0) + amount;
        }
      });

      return {
        success: true,
        data: stats,
        message: 'Dashboard stats fetched successfully'
      };
    } catch (error) {
      return this.handleSupabaseError(error);
    }
  }

  // Get recent transactions
  async getRecentTransactions(limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Recent transactions fetched successfully'
      };
    } catch (error) {
      return this.handleSupabaseError(error);
    }
  }

  // Get records by date
  async getRecordsByDate(date) {
    try {
      const { data, error } = await this.supabase
        .from('records')
        .select('*')
        .eq('transaction_date', date)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data,
        message: `Records for ${date} fetched successfully`
      };
    } catch (error) {
      return this.handleSupabaseError(error);
    }
  }
}

export default new ApiService();
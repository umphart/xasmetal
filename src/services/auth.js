import { supabase } from '../lib/supabase';

class AuthService {
  constructor() {
    this.supabase = supabase;
  }

  // Check if admin exists
  async checkAdminExists() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .limit(1);

      if (error) throw error;

      return {
        success: true,
        exists: data.length > 0,
        message: data.length > 0 ? 'Admin exists' : 'No admin found'
      };
    } catch (error) {
      console.error('Auth error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Register new user WITHOUT email
  async register(username, password) {
    try {
      // Generate a unique ID for the user
      const userId = this.generateUserId();
      
      // Create user record directly in users table (skip Supabase Auth)
      const { data, error } = await this.supabase
        .from('users')
        .insert([
          {
            id: userId,
            username: username,
            password_hash: this.hashPassword(password), // Store hashed password
            role: 'user',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Generate a simple token (for demo purposes - in production use JWT)
      const token = this.generateToken(userId, username);

      return {
        success: true,
        data: {
          user: {
            id: data.id,
            username: data.username,
            role: data.role
          },
          token: token
        },
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  // Login user
  async login(username, password) {
    try {
      // Find user by username and check password
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Check password (in production, use proper password verification)
      const passwordValid = this.verifyPassword(password, userData.password_hash);
      
      if (!passwordValid) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Update last login time
      await this.supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      // Generate token
      const token = this.generateToken(userData.id, userData.username);

      return {
        success: true,
        data: {
          user: {
            id: userData.id,
            username: userData.username,
            role: userData.role
          },
          token: token
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // Get current user
  async getCurrentUser(token) {
    try {
      // Decode token to get user info
      const userInfo = this.decodeToken(token);
      
      if (!userInfo) {
        throw new Error('Invalid token');
      }

      // Get user from database
      const { data: userData, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userInfo.userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          user: {
            id: userData.id,
            username: userData.username,
            role: userData.role
          }
        }
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Simple password hashing (for demo - use bcrypt in production)
  hashPassword(password) {
    // Simple hash for demo - REPLACE WITH PROPER HASHING IN PRODUCTION
    return btoa(password); // Base64 encoding (not secure for production!)
  }

  // Verify password
  verifyPassword(password, hash) {
    // Simple verification for demo - REPLACE WITH PROPER VERIFICATION IN PRODUCTION
    return btoa(password) === hash;
  }

  // Generate simple token (for demo - use JWT in production)
  generateToken(userId, username) {
    const tokenData = {
      userId: userId,
      username: username,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(tokenData)); // Base64 encoding (not secure for production!)
  }

  // Decode token
  decodeToken(token) {
    try {
      const decoded = atob(token);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  // Generate unique user ID
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Store token in localStorage
  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is valid (not expired)
    const userInfo = this.decodeToken(token);
    if (!userInfo) return false;
    
    // Check if token is older than 24 hours (for demo)
    const tokenAge = Date.now() - userInfo.timestamp;
    return tokenAge < 24 * 60 * 60 * 1000; // 24 hours
  }
}

export default new AuthService();
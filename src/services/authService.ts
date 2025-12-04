// Authentication API Service
// This service handles all authentication-related API calls
// Now using real backend API at http://127.0.0.1:8000/

import axios from 'axios';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  BackendAuthResponse, 
  MicrosoftAuthResponse 
} from '../types/auth';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_PUBLIC_AUTH_URL || 'http://127.0.0.1:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/non-auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication service with real backend integration
export const authService = {
  // Traditional email/password login
  async login(credentials: LoginCredentials): Promise<BackendAuthResponse> {
    try {
      const response = await api.post('/api/auth/login/', {
        email: credentials.email,
        password: credentials.password
      });

      // Check for blocked user response first (when API returns success: false with is_blocked: true)
      if (response.data && response.data.is_blocked === true) {
        const errorMessage = response.data.message || 'Your account has been blocked. Please contact your administrator for assistance.';
        throw new Error(errorMessage);
      }

      // Check if success is false (even without is_blocked flag)
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Login failed. Please try again.';
        throw new Error(errorMessage);
      }

      if (response.data && response.data.success && response.data.data) {
        // Check if user is blocked (additional check in case is_blocked is in data.user)
        const user = response.data.data.user;
        if (user && user.is_blocked === true) {
          throw new Error('Your account has been blocked. Please contact your administrator for assistance.');
        }
        return response.data;
      } else {
        // Handle other error cases
        const errorMessage = response.data?.message || 'Invalid response format';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // If error is already a string (our custom blocked user error), throw it as is
      if (error.message && (error.message.includes('blocked') || error.message.includes('Login failed'))) {
        throw error;
      }
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  // User registration
  async register(credentials: RegisterCredentials): Promise<BackendAuthResponse> {
    try {
      const response = await api.post('/api/auth/register/', {
        email: credentials.email,
        password: credentials.password,
        first_name: credentials.name.split(' ')[0] || credentials.name,
        last_name: credentials.name.split(' ')[1] || '',
        confirm_password: credentials.confirmPassword
      });

      if (response.data && response.data.success && response.data.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  // Google OAuth login
  async googleLogin(googleResponse: any): Promise<BackendAuthResponse> {
    try {
      const response = await api.post('/api/user/google-login/', {
        token: googleResponse.access_token
      });

      // Check for blocked user response first (when API returns success: false with is_blocked: true)
      if (response.data && response.data.is_blocked === true) {
        const errorMessage = response.data.message || 'Your account has been blocked. Please contact your administrator for assistance.';
        throw new Error(errorMessage);
      }

      // Check if success is false (even without is_blocked flag)
      if (response.data && response.data.success === false) {
        const errorMessage = response.data.message || 'Google login failed. Please try again.';
        throw new Error(errorMessage);
      }

      if (response.data && response.data.success && response.data.data) {
        // Check if user is blocked (additional check in case is_blocked is in data.user)
        const user = response.data.data.user;
        if (user && user.is_blocked === true) {
          throw new Error('Your account has been blocked. Please contact your administrator for assistance.');
        }
        return response.data;
      } else {
        // Handle other error cases
        const errorMessage = response.data?.message || 'Invalid response format';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      // If error is already a string (our custom blocked user error), throw it as is
      if (error.message && (error.message.includes('blocked') || error.message.includes('Google login failed'))) {
        throw error;
      }
      throw new Error(error.response?.data?.message || error.message || 'Google login failed');
    }
  },

  // Microsoft OAuth login
  async microsoftLogin(microsoftResponse: MicrosoftAuthResponse): Promise<BackendAuthResponse> {
    try {
      const response = await api.post('/api/auth/microsoft-login/', {
        token: microsoftResponse.accessToken
      });

      // Check for blocked user response first (when API returns success: false with is_blocked: true)
      if (response.data && response.data.is_blocked === true) {
        const errorMessage = response.data.message || 'Your account has been blocked. Please contact your administrator for assistance.';
        throw new Error(errorMessage);
      }

      if (response.data && response.data.success && response.data.data) {
        // Check if user is blocked (additional check in case is_blocked is in data.user)
        const user = response.data.data.user;
        if (user && user.is_blocked === true) {
          throw new Error('Your account has been blocked. Please contact your administrator for assistance.');
        }
        return response.data;
      } else {
        // Handle other error cases
        const errorMessage = response.data?.message || 'Invalid response format';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Microsoft login error:', error);
      // If error is already a string (our custom blocked user error), throw it as is
      if (error.message && error.message.includes('blocked')) {
        throw error;
      }
      throw new Error(error.response?.data?.message || error.message || 'Microsoft login failed');
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<BackendAuthResponse> {
    try {
      const response = await api.get('/api/auth/user/');

      if (response.data && response.data.success && response.data.data) {
        // Check if user is blocked
        const user = response.data.data.user;
        if (user && user.is_blocked === true) {
          // Clear tokens if user is blocked
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          throw new Error('Your account has been blocked. Please contact your administrator for assistance.');
        }
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Get current user error:', error);
      // If error is already a string (our custom blocked user error), throw it as is
      if (error.message && error.message.includes('blocked')) {
        throw error;
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to get user data');
    }
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh/', {
        refresh: refreshToken
      });

      const newToken = response.data.access || response.data.token;
      localStorage.setItem('token', newToken);

      return { token: newToken };
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw new Error(error.response?.data?.message || error.message || 'Token refresh failed');
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
};

export default authService;
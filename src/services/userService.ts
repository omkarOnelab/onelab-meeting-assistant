// User Management API Service
// This service handles all user management-related API calls
// Now using real backend API at http://127.0.0.1:8000/

import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_PUBLIC_AUTH_URL || 'http://127.0.0.1:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Note: If VITE_PUBLIC_AUTH_URL already includes /api, use /user/admin/users/...
// If VITE_PUBLIC_AUTH_URL doesn't include /api, use /api/user/admin/users/...
// Based on the API specification: PATCH /api/user/admin/users/123/block/

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

// User Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  sign_up_type: string;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface BlockUserResponse {
  user: User;
}

interface UpdateAdminResponse {
  user: User;
}

// Service Functions
export const userService = {
  // Block or unblock a user
  async blockUser(userId: number, isBlocked: boolean): Promise<ApiResponse<BlockUserResponse>> {
    try {
      const response = await api.patch(`/user/admin/users/${userId}/block/`, {
        is_blocked: isBlocked
      });

      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || (isBlocked ? 'User blocked successfully' : 'User unblocked successfully')
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Block user error:', error);
      throw new Error(error.response?.data?.message || error.message || `Failed to ${isBlocked ? 'block' : 'unblock'} user`);
    }
  },

  // Update admin status of a user
  async updateAdminStatus(userId: number, isAdmin: boolean): Promise<ApiResponse<UpdateAdminResponse>> {
    try {
      const response = await api.patch(`/user/admin/users/${userId}/admin/`, {
        is_admin: isAdmin
      });

      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || (isAdmin ? 'Successfully granted admin access to user' : 'Successfully revoked admin access from user')
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Update admin status error:', error);
      throw new Error(error.response?.data?.message || error.message || `Failed to ${isAdmin ? 'grant' : 'revoke'} admin access`);
    }
  },
};

// Export individual functions for convenience
export const {
  blockUser,
  updateAdminStatus
} = userService;

export default userService;


import { createAsyncThunk } from '@reduxjs/toolkit';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  GoogleAuthResponse, 
  MicrosoftAuthResponse 
} from '../../types/auth';
import authService from '../../services/authService';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Check if user is blocked (additional check, though service should have caught this)
      if (response.data.user && response.data.user.is_blocked === true) {
        // Clear any tokens that might have been set
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Your account has been blocked. Please contact your administrator for assistance.');
      }
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      return response;
    } catch (error: any) {
      // Clear tokens on error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Async thunk for Google OAuth login
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (googleResponse: GoogleAuthResponse, { rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(googleResponse);
      
      // Check if user is blocked (additional check, though service should have caught this)
      if (response.data.user && response.data.user.is_blocked === true) {
        // Clear any tokens that might have been set
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Your account has been blocked. Please contact your administrator for assistance.');
      }
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      return response;
    } catch (error: any) {
      // Clear tokens on error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.message || 'Google login failed');
    }
  }
);

// Async thunk for Microsoft OAuth login
export const microsoftLogin = createAsyncThunk(
  'auth/microsoftLogin',
  async (microsoftResponse: MicrosoftAuthResponse, { rejectWithValue }) => {
    try {
      const response = await authService.microsoftLogin(microsoftResponse);
      
      // Check if user is blocked (additional check, though service should have caught this)
      if (response.data.user && response.data.user.is_blocked === true) {
        // Clear any tokens that might have been set
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return rejectWithValue('Your account has been blocked. Please contact your administrator for assistance.');
      }
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      
      return response;
    } catch (error: any) {
      // Clear tokens on error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.message || 'Microsoft login failed');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// Async thunk for getting current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user profile');
    }
  }
);

// Async thunk for refreshing token
export const refreshUserToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      
      // Update token in localStorage
      localStorage.setItem('token', response.token);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

// Action to check authentication status on app load
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { dispatch }) => {
    const token = authService.getToken();
    const refreshToken = authService.getRefreshToken();
    
    if (token && refreshToken) {
      try {
        // Try to get current user
        await dispatch(getCurrentUser()).unwrap();
        return true;
      } catch (error) {
        // If getting user fails, try to refresh token
        try {
          await dispatch(refreshUserToken()).unwrap();
          await dispatch(getCurrentUser()).unwrap();
          return true;
        } catch (refreshError) {
          // Both failed, clear tokens and return false
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          return false;
        }
      }
    }
    
    return false;
  }
);
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
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      return response;
    } catch (error: any) {
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
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
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
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      return response;
    } catch (error: any) {
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
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      return response;
    } catch (error: any) {
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
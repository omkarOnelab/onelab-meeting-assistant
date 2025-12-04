// Google Calendar API Service
// This service handles all Google Calendar-related API calls

import axios from 'axios';
import type {
  // CalendarEvent,
  CalendarAuthorizationResponse,
  CalendarEventsResponse,
  CalendarTokenStatus
} from '../types/calendar';

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

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Service Functions
// Track active authorization to prevent multiple simultaneous attempts
let activeAuthorization: {
  popup: Window | null;
  cleanup: (() => void) | null;
} | null = null;

export const calendarService = {
  // Start Google Calendar OAuth flow
  async startCalendarAuthorization(): Promise<ApiResponse<CalendarAuthorizationResponse>> {
    try {
      const response = await api.get('/user/auth/google/');

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data,
          message: 'Authorization URL generated successfully'
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Calendar authorization error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to start calendar authorization');
    }
  },

  // Check Google Calendar token status
  async getTokenStatus(): Promise<ApiResponse<CalendarTokenStatus>> {
    try {
      console.log('calendarService: Getting token status...');
      const token = localStorage.getItem('token');
      console.log('calendarService: JWT token exists:', !!token);

      const response = await api.get('/user/auth/google/status/');
      console.log('calendarService: Token status response:', response.data);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Token status retrieved successfully'
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Token status error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get token status');
    }
  },

  // Fetch calendar events
  async getCalendarEvents(params?: {
    max_results?: number;
    days_ahead?: number;
    include_all?: boolean;
  }): Promise<ApiResponse<CalendarEventsResponse>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.max_results) {
        queryParams.append('max_results', params.max_results.toString());
      }
      if (params?.days_ahead) {
        queryParams.append('days_ahead', params.days_ahead.toString());
      }
      if (params?.include_all !== undefined) {
        queryParams.append('include_all', params.include_all.toString());
      }

      const url = `/user/calendar/events/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);

      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Calendar events fetched successfully'
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Calendar events error:', error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Calendar not authorized. Please connect your Google Calendar first.');
      } else if (error.response?.data?.requires_auth) {
        throw new Error('Calendar authorization required. Please connect your Google Calendar.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch calendar events');
      }
    }
  },

  // Get events with Google Meet links only
  async getMeetEvents(params?: {
    max_results?: number;
    days_ahead?: number;
  }): Promise<ApiResponse<CalendarEventsResponse>> {
    return this.getCalendarEvents({
      ...params,
      include_all: false
    });
  },

  // Get all events (including those without Meet links)
  async getAllEvents(params?: {
    max_results?: number;
    days_ahead?: number;
  }): Promise<ApiResponse<CalendarEventsResponse>> {
    return this.getCalendarEvents({
      ...params,
      include_all: true
    });
  },

  // Check if user has calendar authorization
  async hasCalendarAuthorization(): Promise<boolean> {
    try {
      const response = await this.getTokenStatus();
      return response.data.has_authorization && !response.data.is_expired;
    } catch (error) {
      console.error('Error checking calendar authorization:', error);
      return false;
    }
  },

  // 🆕 NEW: Sync calendar meetings to backend database
  async syncCalendarMeetings(params?: {
    days_ahead?: number;
  }): Promise<ApiResponse<{ synced_count: number; meetings: any[] }>> {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.email) {
        throw new Error('User email not found. Please log in again.');
      }

      const payload = {
        user_email: user.email,
        days_ahead: params?.days_ahead || 7
      };

      console.log('calendarService: Syncing calendar meetings with payload:', payload);

      const response = await api.post('/sync-calendar-meetings/', payload);

      if (response.data && response.data.status === 'success') {
        return {
          success: true,
          data: {
            synced_count: response.data.meetings?.length || 0,
            meetings: response.data.meetings || []
          },
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to sync calendar meetings');
      }
    } catch (error: any) {
      console.error('Calendar sync error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to sync calendar meetings');
    }
  },

  // 🆕 NEW: Get synced calendar meetings from backend
  async getSyncedMeetings(params?: {
    status?: string;
    limit?: number;
  }): Promise<ApiResponse<{ meetings: any[]; total_count: number }>> {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.email) {
        throw new Error('User email not found. Please log in again.');
      }

      const queryParams = new URLSearchParams();
      queryParams.append('user_email', user.email);

      if (params?.status) {
        queryParams.append('status', params.status);
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const response = await api.get(`/calendar-meetings/?${queryParams.toString()}`);

      if (response.data && response.data.status === 'success') {
        return {
          success: true,
          data: {
            meetings: response.data.meetings || [],
            total_count: response.data.total_count || 0
          },
          message: 'Synced meetings retrieved successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to get synced meetings');
      }
    } catch (error: any) {
      console.error('Get synced meetings error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to get synced meetings');
    }
  },

  // Open calendar authorization in popup window with proper communication
  async openCalendarAuthorization(retryCount: number = 0): Promise<void> {
    try {
      // Clean up any existing authorization attempt
      if (activeAuthorization) {
        console.log('Cleaning up previous authorization attempt...');
        if (activeAuthorization.cleanup) {
          activeAuthorization.cleanup();
        }
        if (activeAuthorization.popup && !activeAuthorization.popup.closed) {
          try {
            activeAuthorization.popup.close();
          } catch (e) {
            // Ignore errors
          }
        }
        activeAuthorization = null;
      }

      // Validate token before starting authorization
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await this.startCalendarAuthorization();
      if (response.data.authorization_url) {
        return new Promise((resolve, reject) => {
          const popup = window.open(
            response.data.authorization_url,
            'googleCalendarAuth',
            'width=600,height=600,scrollbars=yes,resizable=yes'
          );

          if (!popup) {
            activeAuthorization = null;
            reject(new Error('Popup blocked. Please allow popups for this site.'));
            return;
          }

          let isResolved = false;
          let checkClosedInterval: NodeJS.Timeout | null = null;
          let timeoutId: NodeJS.Timeout | null = null;
          let checkPopupUrl: NodeJS.Timeout | null = null;

          // Cleanup function
          const cleanup = () => {
            if (checkClosedInterval) {
              clearInterval(checkClosedInterval);
              checkClosedInterval = null;
            }
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            if (checkPopupUrl) {
              clearInterval(checkPopupUrl);
              checkPopupUrl = null;
            }
            window.removeEventListener('message', messageListener);
            if (popup && !popup.closed) {
              try {
                popup.close();
              } catch (e) {
                // Ignore errors when closing popup
              }
            }
            // Clear active authorization reference
            if (activeAuthorization && activeAuthorization.popup === popup) {
              activeAuthorization = null;
            }
          };

          // Store active authorization
          activeAuthorization = {
            popup,
            cleanup
          };

          // Listen for messages from the popup
          const messageListener = (event: MessageEvent) => {
            // Check if the message is from the same origin
            if (event.origin !== window.location.origin) {
              return;
            }

            if (isResolved) return;

            if (event.data.type === 'GOOGLE_CALENDAR_AUTH_SUCCESS') {
              isResolved = true;
              cleanup();
              resolve();
            } else if (event.data.type === 'GOOGLE_CALENDAR_AUTH_ERROR') {
              isResolved = true;
              cleanup();
              reject(new Error(event.data.error || 'Authorization failed'));
            }
          };

          window.addEventListener('message', messageListener);

          // Monitor popup URL for errors (check every 500ms)
          checkPopupUrl = setInterval(() => {
            if (isResolved || !popup || popup.closed) {
              if (checkPopupUrl) {
                clearInterval(checkPopupUrl);
                checkPopupUrl = null;
              }
              return;
            }

            try {
              // Try to access popup location (may fail due to cross-origin)
              const popupUrl = popup.location.href;
              
              // Check for error parameters in URL
              if (popupUrl.includes('error=') || popupUrl.includes('error_code=')) {
                const urlParams = new URLSearchParams(popupUrl.split('?')[1] || '');
                const error = urlParams.get('error') || urlParams.get('error_code') || 'Unknown error';
                const errorDescription = urlParams.get('error_description') || '';
                
                isResolved = true;
                cleanup();
                reject(new Error(`Authorization failed: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`));
              }
            } catch (e) {
              // Cross-origin error - this is expected for Google OAuth
              // Continue monitoring
            }
          }, 500);

          // Check if popup is closed manually or unexpectedly
          // Check immediately and frequently to catch closures quickly
          checkClosedInterval = setInterval(() => {
            if (popup.closed && !isResolved) {
              isResolved = true;
              cleanup();
              reject(new Error('Authorization cancelled by user or failed unexpectedly. Please try again.'));
            }
          }, 300);

          // Clean up after 10 minutes
          timeoutId = setTimeout(() => {
            if (!isResolved && popup && !popup.closed) {
              isResolved = true;
              cleanup();
              reject(new Error('Authorization timeout'));
            }
          }, 600000);
        });
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error: any) {
      console.error('Error opening calendar authorization:', error);
      
      // Clear active authorization on error
      if (activeAuthorization) {
        if (activeAuthorization.cleanup) {
          activeAuthorization.cleanup();
        }
        activeAuthorization = null;
      }
      
      // If it's a 401 error, try to refresh token and retry once (max 1 retry)
      if ((error.response?.status === 401 || error.message?.includes('401') || error.message?.includes('unauthorized')) && retryCount === 0) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            console.log('Token expired, attempting refresh...');
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
              refresh: refreshToken
            });

            const { access } = refreshResponse.data;
            localStorage.setItem('token', access);
            
            // Retry the authorization once
            console.log('Token refreshed, retrying authorization...');
            return this.openCalendarAuthorization(1);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear tokens if refresh fails
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          throw new Error('Session expired. Please log in again.');
        }
      }
      
      throw error;
    }
  }
};

// Export individual functions for convenience
export const {
  startCalendarAuthorization,
  getTokenStatus,
  getCalendarEvents,
  getMeetEvents,
  getAllEvents,
  hasCalendarAuthorization,
  openCalendarAuthorization
} = calendarService;

export default calendarService;

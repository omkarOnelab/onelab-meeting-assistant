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

  // Open calendar authorization in popup window with proper communication
  async openCalendarAuthorization(): Promise<void> {
    try {
      const response = await this.startCalendarAuthorization();
      if (response.data.authorization_url) {
        return new Promise((resolve, reject) => {
          const popup = window.open(
            response.data.authorization_url,
            'googleCalendarAuth',
            'width=600,height=600,scrollbars=yes,resizable=yes'
          );

          if (!popup) {
            reject(new Error('Popup blocked. Please allow popups for this site.'));
            return;
          }

          // Listen for messages from the popup
          const messageListener = (event: MessageEvent) => {
            // Check if the message is from the same origin
            if (event.origin !== window.location.origin) {
              return;
            }

            if (event.data.type === 'GOOGLE_CALENDAR_AUTH_SUCCESS') {
              window.removeEventListener('message', messageListener);
              popup.close();
              resolve();
            } else if (event.data.type === 'GOOGLE_CALENDAR_AUTH_ERROR') {
              window.removeEventListener('message', messageListener);
              popup.close();
              reject(new Error(event.data.error || 'Authorization failed'));
            }
          };

          window.addEventListener('message', messageListener);

          // Check if popup is closed manually
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              reject(new Error('Authorization cancelled by user'));
            }
          }, 1000);

          // Clean up after 10 minutes
          setTimeout(() => {
            if (!popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', messageListener);
              popup.close();
              reject(new Error('Authorization timeout'));
            }
          }, 600000);
        });
      } else {
        throw new Error('No authorization URL received');
      }
    } catch (error) {
      console.error('Error opening calendar authorization:', error);
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

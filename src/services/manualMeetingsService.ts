// Manual Meetings API Service
// This service handles all manual meeting-related API calls
// Based on MANUAL_MEETING_API.md specification

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

// Helper to build API path (handles cases where baseURL may or may not include /api)
const getApiPath = (path: string): string => {
  // If path already starts with /api/, use it as is
  if (path.startsWith('/api/')) {
    return path;
  }
  // If baseURL ends with /api, don't add /api/ again
  if (API_BASE_URL.endsWith('/api')) {
    return path.startsWith('/') ? path : `/${path}`;
  }
  // Otherwise, add /api/ prefix
  return path.startsWith('/') ? `/api${path}` : `/api/${path}`;
};

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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// Types based on API documentation
export interface CreatedByUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  sign_up_type: string;
  is_admin: boolean;
  is_blocked: boolean;
}

export interface ManualMeeting {
  id?: number;
  was_scheduled_on_calendar: boolean;
  meet_link: string;
  meeting_schedule_date: string; // YYYY-MM-DD
  meeting_start_time: string; // ISO 8601 format
  meeting_title?: string;
  comments?: Record<string, any>; // JSON object
  status?: string; // pending/scheduled/in_progress/completed/cancelled
  created_by?: number;
  created_by_user?: CreatedByUser;
  calendar_meeting_id?: number | null;
  created_at?: string;
  updated_at?: string;
  is_past_meeting?: boolean;
  days_until_meeting?: number;
}

export interface CreateManualMeetingRequest {
  was_scheduled_on_calendar: boolean;
  meet_link: string;
  meeting_schedule_date: string;
  meeting_start_time: string;
  meeting_title?: string;
  comments?: Record<string, any>;
  user_id: number;
  status?: string;
  calendar_meeting_id?: number | null;
}                                                                                                       

export interface UpdateManualMeetingRequest {
  was_scheduled_on_calendar?: boolean;
  meet_link?: string;
  meeting_schedule_date?: string;
  meeting_start_time?: string;
  meeting_title?: string;
  comments?: Record<string, any>;
  status?: string;
  calendar_meeting_id?: number | null;
}

export interface ManualMeetingsListResponse {
  count: number;
  page: number;
  page_size: number;
  results: ManualMeeting[];
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// API Functions

/**
 * Create a new manual meeting
 * POST /api/manual-meetings/
 */
export const createManualMeeting = async (
  data: CreateManualMeetingRequest
): Promise<ApiResponse<ManualMeeting>> => {
  try {
    const response = await api.post(getApiPath('/manual-meetings/'), data);
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Manual meeting created successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create manual meeting',
    };
  }
};

/**
 * Get a single manual meeting by ID
 * GET /api/manual-meetings/{id}/
 */
export const getManualMeeting = async (
  id: number
): Promise<ApiResponse<ManualMeeting>> => {
  try {
    const response = await api.get(getApiPath(`/manual-meetings/${id}/`));
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch manual meeting',
    };
  }
};

export interface ManualMeetingFilters {
  search_link?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  start_datetime?: string; // ISO 8601
  end_datetime?: string; // ISO 8601
  was_scheduled_on_calendar?: boolean;
  only_upcoming?: boolean;
  only_past?: boolean;
  order_by?: string;
}

/**
 * List all manual meetings with pagination and filters
 * GET /api/manual-meetings/?page=1&page_size=20&user_id=1&search_link=abc&start_date=2025-12-01
 */
export const listManualMeetings = async (
  page: number = 1,
  pageSize: number = 20,
  userId?: number,
  filters?: ManualMeetingFilters
): Promise<ApiResponse<ManualMeetingsListResponse>> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };
    if (userId) {
      params.user_id = userId;
    }

    // Add filter parameters
    if (filters) {
      if (filters.search_link) {
        params.search_link = filters.search_link;
      }
      if (filters.start_date) {
        params.start_date = filters.start_date;
      }
      if (filters.end_date) {
        params.end_date = filters.end_date;
      }
      if (filters.start_datetime) {
        params.start_datetime = filters.start_datetime;
      }
      if (filters.end_datetime) {
        params.end_datetime = filters.end_datetime;
      }
      if (filters.was_scheduled_on_calendar !== undefined) {
        params.was_scheduled_on_calendar = filters.was_scheduled_on_calendar;
      }
      if (filters.only_upcoming) {
        params.only_upcoming = 'true';
      }
      if (filters.only_past) {
        params.only_past = 'true';
      }
      if (filters.order_by) {
        params.order_by = filters.order_by;
      }
    }

    const response = await api.get(getApiPath('/manual-meetings/'), { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch manual meetings',
    };
  }
};

/**
 * Update an existing manual meeting
 * PUT /api/manual-meetings/{id}/
 */
export const updateManualMeeting = async (
  id: number,
  data: UpdateManualMeetingRequest
): Promise<ApiResponse<ManualMeeting>> => {
  try {
    const response = await api.put(getApiPath(`/manual-meetings/${id}/`), data);
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Manual meeting updated successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update manual meeting',
    };
  }
};

/**
 * Delete a manual meeting
 * DELETE /api/manual-meetings/{id}/
 */
export const deleteManualMeeting = async (
  id: number
): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.delete(getApiPath(`/manual-meetings/${id}/`));
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Manual meeting deleted successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to delete manual meeting',
    };
  }
};

const manualMeetingsService = {
  createManualMeeting,
  getManualMeeting,
  listManualMeetings,
  updateManualMeeting,
  deleteManualMeeting,
};

export default manualMeetingsService;


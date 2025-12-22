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
    const response = await api.post('/manual-meetings/', data);
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
    const response = await api.get(`/manual-meetings/${id}/`);
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

/**
 * List all manual meetings with pagination
 * GET /api/manual-meetings/?page=1&page_size=20&user_id=1
 */
export const listManualMeetings = async (
  page: number = 1,
  pageSize: number = 20,
  userId?: number
): Promise<ApiResponse<ManualMeetingsListResponse>> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };
    if (userId) {
      params.user_id = userId;
    }

    const response = await api.get('/manual-meetings/', { params });
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
    const response = await api.put(`/manual-meetings/${id}/`, data);
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
    const response = await api.delete(`/manual-meetings/${id}/`);
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


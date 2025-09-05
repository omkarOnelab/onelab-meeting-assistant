// Dashboard API Service
// This service handles all dashboard-related API calls
// Now using real backend API at http://127.0.0.1:8000/

import axios from 'axios';
import type { 
  SummaryCard, 
  RecentMeeting, 
  PopularTopic, 
  DashboardData,
  MeetingInsight,
  CreateInsightRequest,
  UpdateInsightRequest
} from '../types/dashboard';

// Base API configuration
const API_BASE_URL = 'http://127.0.0.1:8000';
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

// Mock data - will be replaced with actual API calls
const mockSummaryCards: SummaryCard[] = [
  { 
    id: 1,
    icon: 'calendar', 
    count: 0, 
    label: 'Meeting Preps', 
    color: '#ff7a45', 
    bgColor: '#fff2e8' 
  },
  { 
    id: 2,
    icon: 'check', 
    count: 0, 
    label: 'Tasks', 
    color: '#52c41a', 
    bgColor: '#f6ffed' 
  },
  { 
    id: 3,
    icon: 'star', 
    count: 0, 
    label: 'AI Apps', 
    color: '#722ed1', 
    bgColor: '#f9f0ff' 
  },
  { 
    id: 4,
    icon: 'sound', 
    count: 0, 
    label: 'Soundbites', 
    color: '#1890ff', 
    bgColor: '#e6f7ff' 
  }
];

const mockRecentMeetings: RecentMeeting[] = [
  {
    id: 1,
    title: 'DSM for Barkhappy (Nuzzl)',
    date: 'Jul 29, 10:00 AM',
    avatar: 'Y',
    avatarColor: '#1890ff',
          insights: [
        { 
          id: 1,
          meetingId: 1,
          icon: 'warning', 
          text: 'Content Moderation Errors: Legitimate names flagged as inappropriate indicate a need for machine learning adjustments.' 
        },
        { 
          id: 2,
          meetingId: 1,
          icon: 'video', 
          text: 'Face Detection Challenges: Errors in video verification hinder user onboarding and require urgent fixes.' 
        },
        { 
          id: 3,
          meetingId: 1,
          icon: 'lock', 
          text: 'Security Enhancements: Automatic password changes and logout features are being integrated into the login system.' 
        },
        { 
          id: 4,
          meetingId: 1,
          icon: 'mobile', 
          text: 'Mobile Testing Insights: Mixed success rates in photo and video uploads across devices necessitate further evaluation.' 
        },
        { 
          id: 5,
          meetingId: 1,
          icon: 'desktop', 
          text: 'Developer Issues: Email delivery problems in the developer invitation process need immediate resolution.' 
        }
      ]
  },
  {
    id: 2,
    title: 'Sync up call for Nuzzl (Barkhappy)',
    date: 'Jul 15, 5:30 PM',
    avatar: 'Y',
    avatarColor: '#1890ff'
  },
  {
    id: 3,
    title: 'Introductory call with HR',
    date: 'Jul 03, 3:30 PM',
    avatar: 'Y',
    avatarColor: '#1890ff'
  }
];

const mockPopularTopics: PopularTopic[] = [
  // Currently empty as per the original design
];

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Service Functions
export const dashboardService = {
  // Get complete dashboard data
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await api.get('/dashboard/');
      
      return {
        success: true,
        data: response.data,
        message: 'Dashboard data fetched successfully'
      };
    } catch (error: any) {
      console.error('Dashboard data error:', error);
      // Fallback to mock data if API fails
      return {
        success: true,
        data: {
          summaryCards: mockSummaryCards,
          recentMeetings: mockRecentMeetings,
          popularTopics: mockPopularTopics
        },
        message: 'Using fallback data'
      };
    }
  },

  // Get summary cards
  async getSummaryCards(): Promise<ApiResponse<SummaryCard[]>> {
    try {
      const response = await api.get('/dashboard/summary-cards/');
      
      return {
        success: true,
        data: response.data,
        message: 'Summary cards fetched successfully'
      };
    } catch (error: any) {
      console.error('Summary cards error:', error);
      // Fallback to mock data
      return {
        success: true,
        data: mockSummaryCards,
        message: 'Using fallback data'
      };
    }
  },

  // Get recent meetings
  async getRecentMeetings(): Promise<ApiResponse<RecentMeeting[]>> {
    try {
      const response = await api.get('/dashboard/recent-meetings/');
      
      return {
        success: true,
        data: response.data,
        message: 'Recent meetings fetched successfully'
      };
    } catch (error: any) {
      console.error('Recent meetings error:', error);
      // Fallback to mock data
      return {
        success: true,
        data: mockRecentMeetings,
        message: 'Using fallback data'
      };
    }
  },

  // Get popular topics
  async getPopularTopics(): Promise<ApiResponse<PopularTopic[]>> {
    try {
      const response = await api.get('/dashboard/popular-topics/');
      
      return {
        success: true,
        data: response.data,
        message: 'Popular topics fetched successfully'
      };
    } catch (error: any) {
      console.error('Popular topics error:', error);
      // Fallback to mock data
      return {
        success: true,
        data: mockPopularTopics,
        message: 'Using fallback data'
      };
    }
  },

  // Get meeting insights
  async getMeetingInsights(meetingId: number): Promise<ApiResponse<MeetingInsight[]>> {
    try {
      const response = await api.get(`/meetings/${meetingId}/insights/`);
      
      return {
        success: true,
        data: response.data,
        message: 'Meeting insights fetched successfully'
      };
    } catch (error: any) {
      console.error('Meeting insights error:', error);
      // Fallback to mock data
      const meeting = mockRecentMeetings.find(m => m.id === meetingId);
      const insights = meeting?.insights || [];
      
      return {
        success: true,
        data: insights,
        message: 'Using fallback data'
      };
    }
  },

  // Create new insight
  async createInsight(meetingId: number, insightData: CreateInsightRequest): Promise<ApiResponse<MeetingInsight>> {
    try {
      const response = await api.post(`/meetings/${meetingId}/insights/`, insightData);
      
      return {
        success: true,
        data: response.data,
        message: 'Insight created successfully'
      };
    } catch (error: any) {
      console.error('Create insight error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create insight');
    }
  },

  // Update insight
  async updateInsight(insightId: number, insightData: UpdateInsightRequest): Promise<ApiResponse<MeetingInsight>> {
    try {
      const response = await api.put(`/insights/${insightId}/`, insightData);
      
      return {
        success: true,
        data: response.data,
        message: 'Insight updated successfully'
      };
    } catch (error: any) {
      console.error('Update insight error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update insight');
    }
  },

  // Delete insight
  async deleteInsight(insightId: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await api.delete(`/insights/${insightId}/`);
      
      return {
        success: true,
        data: { id: insightId },
        message: 'Insight deleted successfully'
      };
    } catch (error: any) {
      console.error('Delete insight error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete insight');
    }
  },

  // Hide meeting insights
  async hideMeetingInsights(meetingId: number): Promise<ApiResponse<{ meetingId: number }>> {
    try {
      await api.post(`/meetings/${meetingId}/hide-insights/`);
      
      return {
        success: true,
        data: { meetingId },
        message: 'Meeting insights hidden successfully'
      };
    } catch (error: any) {
      console.error('Hide insights error:', error);
      // Don't throw error for hide operation, just log it
      return {
        success: true,
        data: { meetingId },
        message: 'Insights hidden locally'
      };
    }
  }
};

// Export individual functions for convenience
export const {
  getDashboardData,
  getSummaryCards,
  getRecentMeetings,
  getPopularTopics,
  getMeetingInsights,
  createInsight,
  updateInsight,
  deleteInsight,
  hideMeetingInsights
} = dashboardService;

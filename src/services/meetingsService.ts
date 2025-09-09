// Meetings API Service
// This service handles all meeting-related API calls
// Now using real backend API at http://127.0.0.1:8000/

import axios from 'axios';
import type { Meeting, MeetingGroup, CreateMeetingRequest, UpdateMeetingRequest } from '../types/meetings';
import { transcriptsService } from './transcriptsService';

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

// Mock data - will be replaced with actual API calls
const mockMeetings: Meeting[] = [
  {
    id: 1,
    title: 'Fireflies AI Platform Quick Overview',
    presenter: 'Fred Fireflies',
    date: 'Thu, Aug 08 2024',
    time: '03:52 PM',
    duration: '8 mins',
    logo: 'F',
    logoColor: '#722ed1'
  }
];

const mockAllMeetings: MeetingGroup[] = [
  {
    dateRange: 'Jul 27 - Aug 2, 2025',
    meetingCount: 1,
    meetings: [
      {
        id: 1,
        title: 'DSM for Barkhappy (Nuzzl)',
        presenter: 'Yash Mahajan',
        date: 'Tue, Jul 29',
        time: '10:00 AM',
        duration: '49 mins',
        logo: 'Y',
        logoColor: '#1890ff'
      }
    ]
  },
  {
    dateRange: 'Jul 13 - Jul 19, 2025',
    meetingCount: 1,
    meetings: [
      {
        id: 2,
        title: 'Sync up call for Nuzzl (Barkhappy)',
        presenter: 'Yash Mahajan',
        date: 'Tue, Jul 15',
        time: '05:30 PM',
        duration: '51 mins',
        logo: 'Y',
        logoColor: '#1890ff'
      }
    ]
  },
  {
    dateRange: 'Jun 29 - Jul 5, 2025',
    meetingCount: 1,
    meetings: [
      {
        id: 3,
        title: 'Introductory call with HR',
        presenter: 'Yash Mahajan',
        date: 'Thu, Jul 03',
        time: '03:30 PM',
        duration: '38 mins',
        logo: 'Y',
        logoColor: '#1890ff'
      }
    ]
  },
  {
    dateRange: 'Jun 22 - Jun 28, 2025',
    meetingCount: 2,
    meetings: [
      {
        id: 4,
        title: 'DSM for Barkhappy (Nuzzl)',
        presenter: 'Yash Mahajan',
        date: 'Thu, Jun 26',
        time: '10:00 AM',
        duration: '11 mins',
        logo: 'Y',
        logoColor: '#1890ff'
      }
    ]
  }
];

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Service Functions
export const meetingsService = {
  // Get meetings from transcripts API
  async getMeetingsFromTranscripts(userId: string, page: number = 1, pageSize: number = 10): Promise<ApiResponse<Meeting[]>> {
    try {
      const response = await transcriptsService.getTranscripts(userId, page, pageSize);
      const transcripts = response.data;
      
      // Debug logging
      console.log('MeetingsService Debug:', {
        transcriptsLength: transcripts.length,
        transcripts: transcripts.map(t => ({ id: t.id, meetingid: t.meetingid })),
        firstTranscript: transcripts[0]
      });
      
      // Convert transcripts to meetings format
      const meetings: Meeting[] = transcripts.map((transcript) => {
        // Parse the JSON strings safely
        let parsedTranscription = [];
        let parsedActionItem = [];
        
        try {
          parsedTranscription = JSON.parse(transcript.transcription);
        } catch (error) {
          console.error('Error parsing transcription:', error);
          parsedTranscription = [];
        }
        
        try {
          parsedActionItem = JSON.parse(transcript.actionItem);
        } catch (error) {
          console.error('Error parsing actionItem:', error);
          parsedActionItem = [];
        }
        
        return {
          id: transcript.id,
          title: `Meeting ${transcript.meetingid}`,
          presenter: '-', // Not available in API yet
          date: new Date(transcript.created_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          time: new Date(transcript.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }),
          duration: '-', // Not available in API yet
          logo: 'M',
          logoColor: '#722ed1',
          participants: [], // Not available in API yet
          transcript: {
            ...transcript,
            transcription: parsedTranscription,
            actionItem: parsedActionItem
          }
        };
      });

      // Debug logging for final meetings
      console.log('MeetingsService Final Debug:', {
        meetingsLength: meetings.length,
        meetings: meetings.map(m => ({ id: m.id, title: m.title, meetingid: m.transcript?.meetingid }))
      });

      return {
        success: true,
        data: meetings,
        message: 'Meetings fetched successfully from transcripts'
      };
    } catch (error) {
      console.error('Error fetching meetings from transcripts:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch meetings'
      };
    }
  },

  // Get user's meetings
  async getMyMeetings(): Promise<ApiResponse<Meeting[]>> {
    try {
      const response = await api.get('/meetings/my-meetings/');
      
      return {
        success: true,
        data: response.data,
        message: 'Meetings fetched successfully'
      };
    } catch (error: any) {
      console.error('My meetings error:', error);
      // Fallback to mock data
      return {
        success: true,
        data: mockMeetings,
        message: 'Using fallback data'
      };
    }
  },

  // Get all meetings
  async getAllMeetings(): Promise<ApiResponse<MeetingGroup[]>> {
    try {
      const response = await api.get('/meetings/all/');
      
      return {
        success: true,
        data: response.data,
        message: 'All meetings fetched successfully'
      };
    } catch (error: any) {
      console.error('All meetings error:', error);
      // Fallback to mock data
      return {
        success: true,
        data: mockAllMeetings,
        message: 'Using fallback data'
      };
    }
  },

  // Get meetings with pagination
  async getMeetingsPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Meeting>> {
    try {
      const response = await api.get(`/meetings/?page=${page}&limit=${limit}`);
      
      return {
        success: true,
        data: response.data.results || response.data,
        pagination: response.data.pagination || {
          page,
          limit,
          total: response.data.count || response.data.length,
          totalPages: Math.ceil((response.data.count || response.data.length) / limit)
        },
        message: 'Meetings fetched successfully'
      };
    } catch (error: any) {
      console.error('Paginated meetings error:', error);
      // Fallback to mock data
      const allMeetings = mockAllMeetings.flatMap(group => group.meetings);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMeetings = allMeetings.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedMeetings,
        pagination: {
          page,
          limit,
          total: allMeetings.length,
          totalPages: Math.ceil(allMeetings.length / limit)
        },
        message: 'Using fallback data'
      };
    }
  },

  // Get meeting by ID
  async getMeetingById(id: number): Promise<ApiResponse<Meeting>> {
    try {
      const response = await api.get(`/meetings/${id}/`);
      
      return {
        success: true,
        data: response.data,
        message: 'Meeting fetched successfully'
      };
    } catch (error: any) {
      console.error('Get meeting error:', error);
      // Fallback to mock data
      const allMeetings = mockAllMeetings.flatMap(group => group.meetings);
      const meeting = allMeetings.find(m => m.id === id);
      
      if (meeting) {
        return {
          success: true,
          data: meeting,
          message: 'Using fallback data'
        };
      } else {
        throw new Error('Meeting not found');
      }
    }
  },

  // Create new meeting
  async createMeeting(meetingData: CreateMeetingRequest): Promise<ApiResponse<Meeting>> {
    try {
      const response = await api.post('/meetings/', meetingData);
      
      return {
        success: true,
        data: response.data,
        message: 'Meeting created successfully'
      };
    } catch (error: any) {
      console.error('Create meeting error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create meeting');
    }
  },

  // Update meeting
  async updateMeeting(id: number, meetingData: UpdateMeetingRequest): Promise<ApiResponse<Meeting>> {
    try {
      const response = await api.put(`/meetings/${id}/`, meetingData);
      
      return {
        success: true,
        data: response.data,
        message: 'Meeting updated successfully'
      };
    } catch (error: any) {
      console.error('Update meeting error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update meeting');
    }
  },

  // Delete meeting
  async deleteMeeting(id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      await api.delete(`/meetings/${id}/`);
      
      return {
        success: true,
        data: { id },
        message: 'Meeting deleted successfully'
      };
    } catch (error: any) {
      console.error('Delete meeting error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete meeting');
    }
  },

  // Search meetings
  async searchMeetings(query: string): Promise<ApiResponse<Meeting[]>> {
    try {
      const response = await api.get(`/meetings/search/?q=${encodeURIComponent(query)}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Search completed successfully'
      };
    } catch (error: any) {
      console.error('Search meetings error:', error);
      // Fallback to mock data
      const allMeetings = mockAllMeetings.flatMap(group => group.meetings);
      const filteredMeetings = allMeetings.filter(meeting =>
        meeting.title.toLowerCase().includes(query.toLowerCase()) ||
        meeting.presenter.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        success: true,
        data: filteredMeetings,
        message: 'Using fallback data'
      };
    }
  }
};

// Export individual functions for convenience
export const {
  getMyMeetings,
  getAllMeetings,
  getMeetingsPaginated,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  searchMeetings
} = meetingsService;

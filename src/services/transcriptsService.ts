import axios from 'axios';
import type { Transcript } from '../types/transcripts';

const API_BASE_URL = import.meta.env.VITE_PUBLIC_AUTH_URL || 'http://127.0.0.1:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const transcriptsService = {
  async getTranscripts(userId: string, page: number = 1, pageSize: number = 10): Promise<{
    data: Transcript[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await api.get(`/api/transcripts/?userId=${userId}&page=${page}&pageSize=${pageSize}`);
      
      // Debug logging
      console.log('TranscriptsService Debug:', {
        fullResponse: response.data,
        dataArray: response.data.data,
        dataLength: response.data.data?.length,
        pagination: {
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
          totalPages: response.data.totalPages
        }
      });
      
      return {
        data: response.data.data || [],
        pagination: {
          page: response.data.page || page,
          pageSize: response.data.pageSize || pageSize,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0
        }
      };
    } catch (error) {
      console.error('Error fetching transcripts:', error);
      // Return empty data as fallback
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  async getTranscriptById(transcriptId: number): Promise<Transcript | null> {
    try {
      const response = await api.get(`/api/transcripts/${transcriptId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transcript by ID:', error);
      return null;
    }
  }
};

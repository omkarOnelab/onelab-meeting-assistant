// Custom hooks for meetings data management
// These hooks provide a clean interface for components to interact with meeting data
// Currently using mock data - will seamlessly switch to real API when backend is ready

import { useState, useEffect, useCallback } from 'react';
import { meetingsService } from '../services/meetingsService';
import { useAuth } from './useAuth';
import type { 
  Meeting, 
  MeetingGroup, 
  CreateMeetingRequest, 
  UpdateMeetingRequest,
  UseMeetingsReturn,
  UseAllMeetingsReturn,
  UseMeetingReturn,
  UseMeetingMutationsReturn
} from '../types/meetings';

// Hook for fetching user's meetings
export const useMyMeetings = (): UseMeetingsReturn => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await meetingsService.getMyMeetings();
      
      if (response.success) {
        setMeetings(response.data);
      } else {
        setError(response.message || 'Failed to fetch meetings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return {
    meetings,
    loading,
    error,
    refetch: fetchMeetings
  };
};

// Hook for fetching all meetings with pagination
export const useAllMeetings = (page: number = 1, pageSize: number = 10): UseAllMeetingsReturn & {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  setPage: (page: number) => void;
} => {
  const [meetingGroups, setMeetingGroups] = useState<MeetingGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(page);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const { user } = useAuth();

  const fetchAllMeetings = useCallback(async (pageNum: number = currentPage) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use the new transcripts API with pagination
      const response = await meetingsService.getMeetingsFromTranscripts(user.id.toString(), pageNum, pageSize);
      
      if (response.success) {
        // Group meetings by date
        const meetings = response.data;
        const groupedMeetings: { [key: string]: Meeting[] } = {};
        
        meetings.forEach(meeting => {
          const dateKey = meeting.date;
          if (!groupedMeetings[dateKey]) {
            groupedMeetings[dateKey] = [];
          }
          groupedMeetings[dateKey].push(meeting);
        });

        // Convert to MeetingGroup format
        const meetingGroups: MeetingGroup[] = Object.entries(groupedMeetings).map(([dateRange, meetings]) => ({
          dateRange,
          meetingCount: meetings.length,
          meetings
        }));

        setMeetingGroups(meetingGroups);
        
        // Update pagination info (we'll get this from the API response in the future)
        setPagination({
          page: pageNum,
          pageSize: pageSize,
          total: meetings.length, // This will be updated when we get total from API
          totalPages: Math.ceil(meetings.length / pageSize)
        });
      } else {
        setError(response.message || 'Failed to fetch all meetings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching all meetings');
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentPage, pageSize]);

  const setPage = useCallback((pageNum: number) => {
    setCurrentPage(pageNum);
    fetchAllMeetings(pageNum);
  }, [fetchAllMeetings]);

  useEffect(() => {
    fetchAllMeetings(currentPage);
  }, [fetchAllMeetings, currentPage]);

  return {
    meetingGroups,
    loading,
    error,
    refetch: () => fetchAllMeetings(currentPage),
    pagination,
    setPage
  };
};

// Hook for fetching a single meeting by ID
export const useMeeting = (id: number): UseMeetingReturn => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeeting = useCallback(async () => {
    if (!id) {
      setMeeting(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await meetingsService.getMeetingById(id);
      
      if (response.success) {
        setMeeting(response.data);
      } else {
        setError(response.message || 'Failed to fetch meeting');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching meeting');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  return {
    meeting,
    loading,
    error,
    refetch: fetchMeeting
  };
};

// Hook for meeting mutations (create, update, delete)
export const useMeetingMutations = (): UseMeetingMutationsReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createMeeting = useCallback(async (data: CreateMeetingRequest): Promise<Meeting> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await meetingsService.createMeeting(data);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create meeting');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMeeting = useCallback(async (id: number, data: UpdateMeetingRequest): Promise<Meeting> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await meetingsService.updateMeeting(id, data);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update meeting');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMeeting = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await meetingsService.deleteMeeting(id);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete meeting');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting meeting';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createMeeting,
    updateMeeting,
    deleteMeeting,
    loading,
    error
  };
};

// Hook for searching meetings
export const useMeetingSearch = (query: string) => {
  const [results, setResults] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchMeetings = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await meetingsService.searchMeetings(searchQuery);
      
      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.message || 'Search failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMeetings(query);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [query, searchMeetings]);

  return {
    results,
    loading,
    error,
    searchMeetings
  };
};

// Combined hook for meetings page
export const useMeetingsPage = (page: number = 1, pageSize: number = 10) => {
  const myMeetings = useMyMeetings();
  const allMeetings = useAllMeetings(page, pageSize);
  const mutations = useMeetingMutations();

  // Flatten the meeting groups into a single array of meetings
  const flattenedMeetings = allMeetings.meetingGroups.flatMap(group => group.meetings);

  return {
    myMeetings: myMeetings.meetings,
    myMeetingsLoading: myMeetings.loading,
    myMeetingsError: myMeetings.error,
    refetchMyMeetings: myMeetings.refetch,
    
    allMeetings: flattenedMeetings,
    allMeetingsLoading: allMeetings.loading,
    allMeetingsError: allMeetings.error,
    refetchAllMeetings: allMeetings.refetch,
    pagination: allMeetings.pagination,
    setPage: allMeetings.setPage,
    
    createMeeting: mutations.createMeeting,
    updateMeeting: mutations.updateMeeting,
    deleteMeeting: mutations.deleteMeeting,
    mutationsLoading: mutations.loading,
    mutationsError: mutations.error
  };
};


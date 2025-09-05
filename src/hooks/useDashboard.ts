// Custom hooks for dashboard data management
// These hooks provide a clean interface for components to interact with dashboard data
// Currently using mock data - will seamlessly switch to real API when backend is ready

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { 
  DashboardData,
  SummaryCard,
  RecentMeeting,
  PopularTopic,
  MeetingInsight,
  CreateInsightRequest,
  UpdateInsightRequest,
  UseDashboardDataReturn,
  UseSummaryCardsReturn,
  UseRecentMeetingsReturn,
  UsePopularTopicsReturn,
  UseMeetingInsightsReturn,
  UseInsightMutationsReturn
} from '../types/dashboard';

// Hook for fetching complete dashboard data
export const useDashboardData = (): UseDashboardDataReturn => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getDashboardData();
      
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData
  };
};

// Hook for fetching summary cards
export const useSummaryCards = (): UseSummaryCardsReturn => {
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummaryCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getSummaryCards();
      
      if (response.success) {
        setSummaryCards(response.data);
      } else {
        setError(response.message || 'Failed to fetch summary cards');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching summary cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummaryCards();
  }, [fetchSummaryCards]);

  return {
    summaryCards,
    loading,
    error,
    refetch: fetchSummaryCards
  };
};

// Hook for fetching recent meetings
export const useRecentMeetings = (): UseRecentMeetingsReturn => {
  const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getRecentMeetings();
      
      if (response.success) {
        setRecentMeetings(response.data);
      } else {
        setError(response.message || 'Failed to fetch recent meetings');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching recent meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentMeetings();
  }, [fetchRecentMeetings]);

  return {
    recentMeetings,
    loading,
    error,
    refetch: fetchRecentMeetings
  };
};

// Hook for fetching popular topics
export const usePopularTopics = (): UsePopularTopicsReturn => {
  const [popularTopics, setPopularTopics] = useState<PopularTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getPopularTopics();
      
      if (response.success) {
        setPopularTopics(response.data);
      } else {
        setError(response.message || 'Failed to fetch popular topics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching popular topics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopularTopics();
  }, [fetchPopularTopics]);

  return {
    popularTopics,
    loading,
    error,
    refetch: fetchPopularTopics
  };
};

// Hook for fetching meeting insights
export const useMeetingInsights = (meetingId: number): UseMeetingInsightsReturn => {
  const [insights, setInsights] = useState<MeetingInsight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!meetingId) {
      setInsights([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.getMeetingInsights(meetingId);
      
      if (response.success) {
        setInsights(response.data);
      } else {
        setError(response.message || 'Failed to fetch meeting insights');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching meeting insights');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights
  };
};

// Hook for insight mutations (create, update, delete, hide)
export const useInsightMutations = (): UseInsightMutationsReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createInsight = useCallback(async (meetingId: number, data: CreateInsightRequest): Promise<MeetingInsight> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.createInsight(meetingId, data);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create insight');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating insight';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInsight = useCallback(async (insightId: number, data: UpdateInsightRequest): Promise<MeetingInsight> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.updateInsight(insightId, data);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update insight');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating insight';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInsight = useCallback(async (insightId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.deleteInsight(insightId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete insight');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting insight';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const hideInsights = useCallback(async (meetingId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardService.hideMeetingInsights(meetingId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to hide insights');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while hiding insights';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createInsight,
    updateInsight,
    deleteInsight,
    hideInsights,
    loading,
    error
  };
};

// Combined hook for dashboard page
export const useDashboardPage = () => {
  const dashboardData = useDashboardData();
  const summaryCards = useSummaryCards();
  const recentMeetings = useRecentMeetings();
  const popularTopics = usePopularTopics();
  const insightMutations = useInsightMutations();

  return {
    // Dashboard data
    dashboardData: dashboardData.dashboardData,
    dashboardLoading: dashboardData.loading,
    dashboardError: dashboardData.error,
    refetchDashboard: dashboardData.refetch,
    
    // Summary cards
    summaryCards: summaryCards.summaryCards,
    summaryCardsLoading: summaryCards.loading,
    summaryCardsError: summaryCards.error,
    refetchSummaryCards: summaryCards.refetch,
    
    // Recent meetings
    recentMeetings: recentMeetings.recentMeetings,
    recentMeetingsLoading: recentMeetings.loading,
    recentMeetingsError: recentMeetings.error,
    refetchRecentMeetings: recentMeetings.refetch,
    
    // Popular topics
    popularTopics: popularTopics.popularTopics,
    popularTopicsLoading: popularTopics.loading,
    popularTopicsError: popularTopics.error,
    refetchPopularTopics: popularTopics.refetch,
    
    // Insight mutations
    createInsight: insightMutations.createInsight,
    updateInsight: insightMutations.updateInsight,
    deleteInsight: insightMutations.deleteInsight,
    hideInsights: insightMutations.hideInsights,
    mutationsLoading: insightMutations.loading,
    mutationsError: insightMutations.error
  };
};


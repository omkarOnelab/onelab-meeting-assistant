import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService, type DashboardStats } from '../services/dashboardService';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await dashboardService.getDashboardStats();

      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh every 5 minutes
    intervalRef.current = setInterval(() => {
      fetchDashboardData(true); // Pass true to indicate it's a refresh
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchDashboardData]);

  const refetch = useCallback(() => {
    fetchDashboardData(true); // Pass true to indicate it's a refresh
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    refreshing,
    error,
    refetch
  };
};
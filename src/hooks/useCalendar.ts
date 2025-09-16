import { useState, useCallback } from 'react';
import { calendarService } from '../services/calendarService';
import type {
  // CalendarEvent,
  CalendarState,
  CalendarActions,
  CalendarEventFilters,
  // CalendarTokenStatus
} from '../types/calendar';

export const useCalendar = (): CalendarState & CalendarActions => {
  const [state, setState] = useState<CalendarState>({
    events: [],
    loading: false,
    error: null,
    hasAuthorization: false,
    tokenStatus: null,
    lastFetched: null
  });

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Check authorization status
  const checkAuthorization = useCallback(async () => {
    try {
      console.log('useCalendar: Checking authorization...');
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await calendarService.getTokenStatus();
      console.log('useCalendar: Token status response:', response);

      setState(prev => ({
        ...prev,
        hasAuthorization: response.data.has_authorization && !response.data.is_expired,
        tokenStatus: response.data,
        loading: false
      }));
    } catch (error: any) {
      console.log('useCalendar: Authorization check error:', error);
      setState(prev => ({
        ...prev,
        hasAuthorization: false,
        tokenStatus: null,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  // Start calendar authorization
  const startAuthorization = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      await calendarService.openCalendarAuthorization();

      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  // Fetch calendar events
  const fetchEvents = useCallback(async (filters?: CalendarEventFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await calendarService.getCalendarEvents(filters);

      setState(prev => ({
        ...prev,
        events: response.data.events,
        loading: false,
        lastFetched: new Date()
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  // Fetch only events with Google Meet links
  const fetchMeetEvents = useCallback(async (filters?: Omit<CalendarEventFilters, 'include_all'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await calendarService.getMeetEvents(filters);

      setState(prev => ({
        ...prev,
        events: response.data.events,
        loading: false,
        lastFetched: new Date()
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  // Refresh events (re-fetch with same filters)
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  return {
    // State
    ...state,

    // Actions
    fetchEvents,
    fetchMeetEvents,
    checkAuthorization,
    startAuthorization,
    clearError,
    refreshEvents
  };
};

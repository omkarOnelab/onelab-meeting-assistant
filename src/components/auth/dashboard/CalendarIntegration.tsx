import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useCalendar } from '../../../hooks/useCalendar';
import { message } from 'antd';

const CalendarIntegration: React.FC = () => {
  const {
    events,
    loading,
    error,
    hasAuthorization,
    tokenStatus,
    lastFetched,
    fetchMeetEvents,
    checkAuthorization,
    startAuthorization,
    clearError,
    refreshEvents
  } = useCalendar();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Track initial auth check
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false); // Track if we've fetched events at least once

  // Debug logging
  console.log('CalendarIntegration render:', {
    hasAuthorization,
    loading,
    error,
    eventsCount: events.length,
    tokenStatus,
    isCheckingAuth,
    hasInitiallyFetched
  });

  // Check authorization status on component mount
  useEffect(() => {
    console.log('CalendarIntegration: Checking authorization on mount');
    const checkAuth = async () => {
      try {
        await checkAuthorization();
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [checkAuthorization]);

  // Auto-fetch events if authorized
  useEffect(() => {
    if (hasAuthorization && !hasInitiallyFetched) {
      const fetchInitialEvents = async () => {
        try {
          await fetchMeetEvents({ max_results: 10, days_ahead: 30 });
        } catch (error: any) {
          console.error('Initial fetch error:', error);
          // Don't show error message on initial load - user will see error state in UI
        } finally {
          setHasInitiallyFetched(true);
        }
      };
      fetchInitialEvents();
    }
  }, [hasAuthorization, hasInitiallyFetched, fetchMeetEvents]);

  const handleConnectCalendar = async () => {
    try {
      setIsConnecting(true);
      await startAuthorization();
      message.success('Google Calendar connected successfully!');

      // Refresh authorization status and events
      await checkAuthorization();
      await fetchMeetEvents();
    } catch (error: any) {
      console.error('Calendar authorization error:', error);
      if (error.message.includes('Popup blocked')) {
        message.error('Please allow popups for this site to connect Google Calendar');
      } else if (error.message.includes('cancelled')) {
        message.info('Calendar authorization was cancelled');
      } else {
        message.error(error.message || 'Failed to connect Google Calendar');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefreshEvents = async () => {
    try {
      // Show info message that this may take time
      const loadingMessage = message.loading('Fetching events from Google Calendar... This may take a moment.', 0);
      
      await refreshEvents();
      
      // Close loading message
      loadingMessage();
      message.success('Calendar events refreshed successfully!');
    } catch (error: any) {
      console.error('Refresh events error:', error);
      
      // Show specific error message
      if (error.message?.includes('timeout')) {
        message.error({
          content: 'Google Calendar is taking too long to respond. Please try again in a moment.',
          duration: 5
        });
      } else if (error.message?.includes('not authorized')) {
        message.error({
          content: 'Calendar connection lost. Please reconnect your Google Calendar.',
          duration: 5
        });
      } else {
        message.error({
          content: error.message || 'Failed to refresh events. Please try again.',
          duration: 5
        });
      }
    }
  };

  const formatEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const startStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const endStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${startStr} - ${endStr}`;
  };

  const formatEventDate = (startTime: string) => {
    const date = new Date(startTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getAttendeeCount = (attendees: any[]) => {
    return attendees?.length || 0;
  };

  // Show loading state while checking authorization
  if (isCheckingAuth) {
    return (
      <Card className="bg-white border-0 shadow-card" data-calendar-section>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            Checking Calendar Status
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Please wait while we check your Google Calendar connection...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!hasAuthorization) {
    return (
      <Card className="bg-white border-0 shadow-card" data-calendar-section>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            Connect Google Calendar
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Connect your Google Calendar to see upcoming meetings with Google Meet links
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            onClick={handleConnectCalendar}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Connect Calendar
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            You'll be redirected to Google to authorize calendar access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-card" data-calendar-section>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Google Calendar Connected
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {events.length} upcoming meetings found
                {lastFetched && (
                  <span className="ml-2">
                    • Last updated {lastFetched.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleRefreshEvents}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
            <Button
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 ml-auto"
            >
              ×
            </Button>
          </div>
        )}

        {/* Show loading if we haven't fetched initially OR if loading with no events */}
        {(!hasInitiallyFetched || (loading && events.length === 0)) ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-muted-foreground">Loading calendar events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">No upcoming meetings found</p>
            <p className="text-sm text-muted-foreground">
              Meetings with Google Meet links will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-foreground text-sm">
                        {event.summary}
                      </h4>
                      {event.hangout_link && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          Google Meet
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatEventDate(event.start_time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatEventTime(event.start_time, event.end_time)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{getAttendeeCount(event.attendees)} attendees</span>
                      </div>
                    </div>

                    {event.location && (
                      <p className="text-xs text-muted-foreground mb-2">
                        📍 {event.location}
                      </p>
                    )}
                  </div>

                  {event.hangout_link && (
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="ml-3 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700"
                    >
                      <a
                        href={event.hangout_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarIntegration;

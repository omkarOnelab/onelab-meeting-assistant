// Calendar Types
// Type definitions for Google Calendar integration

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start_time: string;
  end_time: string;
  hangout_link?: string;
  attendees: CalendarAttendee[];
  location: string;
  creator: CalendarPerson;
  organizer: CalendarPerson;
  status: 'confirmed' | 'tentative' | 'cancelled';
  html_link: string;
}

export interface CalendarAttendee {
  email: string;
  name: string;
  response_status: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  optional: boolean;
}

export interface CalendarPerson {
  email: string;
  name: string;
}

export interface CalendarAuthorizationResponse {
  authorization_url: string;
  message: string;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  total_count: number;
  filters_applied: {
    max_results: number;
    days_ahead: number;
    meet_links_only: boolean;
  };
}

export interface CalendarTokenStatus {
  has_authorization: boolean;
  is_expired: boolean;
  expires_at: string;
  expires_in_seconds: number;
  scopes: string;
  last_refresh?: string;
  can_refresh: boolean;
  message?: string;
}

export interface CalendarEventFilters {
  max_results?: number;
  days_ahead?: number;
  include_all?: boolean;
}

export interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  hasAuthorization: boolean;
  tokenStatus: CalendarTokenStatus | null;
  lastFetched: Date | null;
}

export interface CalendarActions {
  fetchEvents: (filters?: CalendarEventFilters) => Promise<void>;
  fetchMeetEvents: (filters?: Omit<CalendarEventFilters, 'include_all'>) => Promise<void>;
  checkAuthorization: () => Promise<void>;
  startAuthorization: () => Promise<void>;
  clearError: () => void;
  refreshEvents: () => Promise<void>;
}

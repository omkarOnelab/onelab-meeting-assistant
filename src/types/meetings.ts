// Meeting Types
// TypeScript interfaces for meeting-related data structures

export interface Meeting {
  id: number;
  name: string;  // Meeting title (updated from API)
  title?: string;  // Legacy field
  presenter?: string;  // Legacy field
  host: string;  // Meeting organizer/host
  date: string;
  time: string;
  duration: string;
  status: string;
  participants: number;  // Number of attendees
  meetingid: string;
  userId: string;

  // 🆕 NEW: Rich calendar data
  attendees?: Array<{
    email: string;
    name: string;
    response_status: string;
    optional: boolean;
  }>;
  organizer_email?: string;
  has_calendar_data?: boolean;
  scheduled_time?: string;
  meeting_status?: string;
  email_automation_ready?: boolean;

  // Legacy fields for backward compatibility
  logo?: string;
  logoColor?: string;
  description?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  transcript?: any;
}

export interface MeetingGroup {
  dateRange: string;
  meetingCount: number;
  meetings: Meeting[];
}

// API Request Types
export interface CreateMeetingRequest {
  title: string;
  presenter: string;
  date: string;
  time: string;
  duration?: string;
  description?: string;
  participants?: string[];
}

export interface UpdateMeetingRequest {
  title?: string;
  presenter?: string;
  date?: string;
  time?: string;
  duration?: string;
  description?: string;
  participants?: string[];
  status?: 'scheduled' | 'completed' | 'cancelled';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

// Hook Return Types
export interface UseMeetingsReturn {
  meetings: Meeting[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseAllMeetingsReturn {
  meetingGroups: MeetingGroup[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseMeetingReturn {
  meeting: Meeting | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseMeetingMutationsReturn {
  createMeeting: (data: CreateMeetingRequest) => Promise<Meeting>;
  updateMeeting: (id: number, data: UpdateMeetingRequest) => Promise<Meeting>;
  deleteMeeting: (id: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Search and Filter Types
export interface MeetingSearchParams {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  presenter?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface MeetingFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  presenter?: string;
  status?: string;
  duration?: {
    min: number;
    max: number;
  };
}


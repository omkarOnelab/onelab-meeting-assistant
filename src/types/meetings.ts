// Meeting Types
// TypeScript interfaces for meeting-related data structures

export interface Meeting {
  id: number;
  title: string;
  presenter: string;
  date: string;
  time: string;
  duration: string;
  logo: string;
  logoColor: string;
  // Additional fields for production
  description?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  participants?: string[];
  recordingUrl?: string;
  transcriptUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  // Transcript data from API
  transcript?: any; // Will store ParsedTranscript data
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


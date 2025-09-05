// Dashboard Types
// TypeScript interfaces for dashboard-related data structures

export interface SummaryCard {
  id: number;
  icon: string;
  count: number;
  label: string;
  color: string;
  bgColor: string;
  // Additional fields for production
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  lastUpdated?: string;
}

export interface MeetingInsight {
  id: number;
  meetingId: number;
  icon: string;
  text: string;
  // Additional fields for production
  type?: 'warning' | 'info' | 'success' | 'error';
  priority?: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

export interface RecentMeeting {
  id: number;
  title: string;
  date: string;
  avatar: string;
  avatarColor: string;
  insights?: MeetingInsight[];
  // Additional fields for production
  duration?: string;
  participants?: string[];
  status?: 'completed' | 'scheduled' | 'cancelled';
  recordingUrl?: string;
  transcriptUrl?: string;
}

export interface PopularTopic {
  id: number;
  title: string;
  description?: string;
  meetingCount: number;
  lastActivity: string;
  // Additional fields for production
  tags?: string[];
  category?: string;
  trending?: boolean;
}

export interface DashboardData {
  summaryCards: SummaryCard[];
  recentMeetings: RecentMeeting[];
  popularTopics: PopularTopic[];
}

// API Request Types
export interface CreateInsightRequest {
  icon: string;
  text: string;
  type?: 'warning' | 'info' | 'success' | 'error';
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateInsightRequest {
  icon?: string;
  text?: string;
  type?: 'warning' | 'info' | 'success' | 'error';
  priority?: 'low' | 'medium' | 'high';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Hook Return Types
export interface UseDashboardDataReturn {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseSummaryCardsReturn {
  summaryCards: SummaryCard[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseRecentMeetingsReturn {
  recentMeetings: RecentMeeting[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UsePopularTopicsReturn {
  popularTopics: PopularTopic[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseMeetingInsightsReturn {
  insights: MeetingInsight[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseInsightMutationsReturn {
  createInsight: (meetingId: number, data: CreateInsightRequest) => Promise<MeetingInsight>;
  updateInsight: (insightId: number, data: UpdateInsightRequest) => Promise<MeetingInsight>;
  deleteInsight: (insightId: number) => Promise<void>;
  hideInsights: (meetingId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Filter and Search Types
export interface DashboardFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  meetingStatus?: string;
  insightType?: string;
  priority?: string;
}

export interface DashboardSearchParams {
  query?: string;
  filters?: DashboardFilters;
  page?: number;
  limit?: number;
}


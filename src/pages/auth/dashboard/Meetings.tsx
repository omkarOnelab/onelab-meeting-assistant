import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Users,
  Clock,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import axios from "axios";
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';

// API Response Types
interface ApiResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: Array<{
    id: number;
    userId: string;
    meetingid: string;
    transcription: any;
    summary: string;
    actionItem: any;
    created_at: string;
    // 🆕 Calendar integration fields
    meeting_title?: string;
    organizer?: {
      name?: string;
      email?: string;
    };
    attendee_count?: number;
    actual_duration?: string;
    scheduled_time?: string;
    attendees?: Array<{
      email: string;
      name?: string;
      response_status: string;
      optional?: boolean;
    }>;
    calendar_meeting?: {
      status?: string;
    };
    email_automation_ready?: boolean;
    has_calendar_data?: boolean;
    meeting_status?: string;
  }>;
}

interface Meeting {
  id: number;
  name: string;
  participants: number;
  host: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  meetingid: string;
  userId: string;
  // 🆕 Additional properties from calendar integration
  attendees?: Array<{
    email: string;
    name?: string;
    response_status: string;
    optional?: boolean;
  }>;
  organizer_email?: string;
  has_calendar_data?: boolean;
  scheduled_time?: string;
  meeting_status?: string;
}

const Meetings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const pageSize = 10; // Show 10 entries per page
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get view type and page from URL params and determine if user is admin
  const viewType = searchParams.get('view') || 'my'; // Default to 'my' if no param
  const pageParam = searchParams.get('page');
  const isAdmin = viewType === 'all';
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch meetings from API
  const fetchMeetings = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      // Determine API endpoint based on user role

      // Use different API endpoints based on admin status
      const userId = user?.id || '5'; // Use actual user ID or fallback
      const searchParam = appliedSearchTerm ? `&search=${encodeURIComponent(appliedSearchTerm)}` : '';
      const apiUrl = isAdmin
        ? `${import.meta.env.VITE_PUBLIC_AUTH_URL}/transcripts/?page=${page}&pageSize=${pageSize}${searchParam}` // All meetings for admin
        : `${import.meta.env.VITE_PUBLIC_AUTH_URL}/transcripts/?userId=${userId}&page=${page}&pageSize=${pageSize}${searchParam}`; // User's meetings

      const response = await axios.get<ApiResponse>(apiUrl);

      // Transform API data to UI format with rich calendar data
      const transformedMeetings: Meeting[] = response.data.data.map((item) => {
        // Use calendar data if available, fallback to legacy format
        const meetingTitle = item.meeting_title || `Meeting ${item.meetingid}`;
        const organizerName = item.organizer?.name || item.organizer?.email?.split('@')[0] || "Unknown";
        const attendeeCount = item.attendee_count || 0;
        const actualDuration = item.actual_duration || "-";

        // Use scheduled time if available, fallback to created time
        const displayDate = item.scheduled_time ? new Date(item.scheduled_time) : new Date(item.created_at);

        return {
          id: item.id,
          name: meetingTitle,  // 🆕 Real meeting title from calendar
          participants: attendeeCount,  // 🆕 Real attendee count
          host: organizerName,  // 🆕 Real organizer name
          date: displayDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          time: displayDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          duration: actualDuration,  // 🆕 Real meeting duration
          status: item.calendar_meeting?.status || item.meeting_status || "completed",  // 🆕 Use actual call status
          meetingid: item.meetingid,
          userId: item.userId,
          // 🆕 Additional rich data for detailed view
          attendees: item.attendees || [],
          organizer_email: item.organizer?.email || "",
          has_calendar_data: item.has_calendar_data || false,
          scheduled_time: item.scheduled_time,
          meeting_status: item.meeting_status || "completed"
        };
      });

      setMeetings(transformedMeetings);
      setTotalPages(response.data.totalPages);
      setTotalMeetings(response.data.total);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  // Set current page from URL parameter
  useEffect(() => {
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (pageNumber > 0) {
        setCurrentPage(pageNumber);
      }
    }
  }, [pageParam]);

  useEffect(() => {
    setTotalMeetings(0);
    fetchMeetings(currentPage);
  }, [currentPage, viewType, appliedSearchTerm]);

  // Server-side filtering, so we use meetings directly
  const filteredMeetings = meetings;

  const handleMeetingClick = (meetingId: number) => {
    navigate(`/auth/meetings/${meetingId}?view=${viewType}&page=${currentPage}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleApplySearch = () => {
    setAppliedSearchTerm(searchTerm);
    setCurrentPage(1); // Reset to first page when applying search
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
  };

  // Generate pagination page numbers with smart display
  const getPaginationPages = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // If total pages is less than max, show all
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Determine which pages to show around current page
    let showStartEllipsis = false;
    let showEndEllipsis = false;
    let startPage = 0;
    let endPage = 0;

    if (currentPage <= 3) {
      // Near the start: show 1, 2, 3, 4, ..., last
      startPage = 2;
      endPage = 4;
      showEndEllipsis = true;
    } else if (currentPage >= totalPages - 2) {
      // Near the end: show 1, ..., last-3, last-2, last-1, last
      startPage = totalPages - 3;
      endPage = totalPages - 1;
      showStartEllipsis = true;
    } else {
      // In the middle: show 1, ..., current-1, current, current+1, ..., last
      startPage = currentPage - 1;
      endPage = currentPage + 1;
      showStartEllipsis = true;
      showEndEllipsis = true;
    }

    // Add start ellipsis if needed
    if (showStartEllipsis && startPage > 2) {
      pages.push('ellipsis-start');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Add end ellipsis if needed
    if (showEndEllipsis && endPage < totalPages - 1) {
      pages.push('ellipsis-end');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-8 py-4 bg-white/90 backdrop-blur-sm border-b border-gray-200/60 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {isAdmin ? 'All Meetings' : 'My Meetings'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalMeetings} meetings found
                {appliedSearchTerm && (
                  <span className="ml-2 text-[#078586] font-medium">
                    (filtered by "{appliedSearchTerm}")
                  </span>
                )}
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-3">
              <div className="relative w-80 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#078586] w-4 h-4 z-10" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
                <Input
                  placeholder="Search meetings..."
                  className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg shadow-md focus:border-[#078586] focus:ring-2 focus:ring-[#078586]/20 transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplySearch();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleApplySearch}
                className="bg-[#078586] hover:bg-[#078586]/90 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
              >
                Apply
              </Button>
              {appliedSearchTerm && (
                <Button
                  onClick={handleClearSearch}
                  variant="outline"
                  className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#078586]/20 border-t-[#078586] mx-auto mb-6"></div>
              <p className="text-[#282F3B] text-lg font-medium">Loading meetings...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
              <p className="text-red-500 mb-6 text-lg font-medium">{error}</p>
              <Button
                onClick={() => fetchMeetings(currentPage)}
                className="bg-[#078586] hover:bg-[#078586]/90 text-white px-6 py-3 rounded-lg transition-all duration-200"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Meetings List */}
        {!loading && !error && (
          <>
            <div className="p-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/60">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Meeting</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Host</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Participants</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Duration</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#282F3B]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {filteredMeetings.map((meeting) => (
                        <tr
                          key={meeting.id}
                          className="hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
                          onClick={() => handleMeetingClick(meeting.id)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#078586]/10 to-[#078586]/5 rounded-lg flex items-center justify-center mr-4">
                                <Calendar className="w-5 h-5 text-[#078586]" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#282F3B]">
                                  {meeting.name}
                                </div>
                                <div className="text-xs text-[#282F3B]/60">
                                  ID: {meeting.meetingid}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-[#078586]" />
                              <div className="flex flex-col">
                                <span className="text-sm text-[#282F3B]/70 font-medium">
                                  {meeting.host}
                                </span>
                                {meeting.organizer_email && (
                                  <span className="text-xs text-[#282F3B]/50">
                                    {meeting.organizer_email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2 text-[#078586]" />
                              <span className="text-sm text-[#282F3B]/70">
                                {meeting.participants === 0 ? "-" : `${meeting.participants} attendees`}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-[#078586]" />
                              <span className="text-sm text-[#282F3B]/70">
                                {meeting.date}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-[#078586]" />
                              <span className="text-sm text-[#282F3B]/70">
                                {meeting.time}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#282F3B]/70">
                              {meeting.duration}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${meeting.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : meeting.status === 'in_progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : meeting.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : meeting.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                              {meeting.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="inline-flex items-center text-sm text-[#078586] hover:text-[#078586]/80 font-medium transition-colors duration-200">
                              View Details
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-lg">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[#282F3B]/70 font-medium whitespace-nowrap">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center space-x-1 overflow-x-auto max-w-full">
                    {getPaginationPages().map((page, index) => {
                      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="flex h-8 w-8 items-center justify-center text-[#282F3B]/50 flex-shrink-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </span>
                        );
                      }
                      
                      const pageNum = page as number;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 p-0 rounded-lg font-medium transition-all duration-200 text-sm flex-shrink-0 ${
                            currentPage === pageNum
                              ? "bg-[#078586] text-white shadow-lg"
                              : "border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586]"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Meetings;
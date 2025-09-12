import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronRight
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
    transcription: string;
    summary: string;
    actionItem: string;
    created_at: string;
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
}

const Meetings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const pageSize = 6; // Show 5 cards per page
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
      
      console.log("isAdmin", isAdmin);
      console.log("user?.id", user?.id);
      
      // Use different API endpoints based on admin status
      const userId = user?.id || '5'; // Use actual user ID or fallback
      const apiUrl = isAdmin 
        ? `${import.meta.env.VITE_PUBLIC_AUTH_URL}/transcripts/?page=${page}&pageSize=${pageSize}` // All meetings for admin
        : `${import.meta.env.VITE_PUBLIC_AUTH_URL}/transcripts/?userId=${userId}&page=${page}&pageSize=${pageSize}`; // User's meetings
      
      const response = await axios.get<ApiResponse>(apiUrl);
      
      // Transform API data to UI format
      const transformedMeetings: Meeting[] = response.data.data.map((item) => ({
        id: item.id,
        name: `Meeting ${item.meetingid}`,
        participants: 0, // Not available in API
        host: "-", // Not available in API
        date: new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }),
        time: new Date(item.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        duration: "-", // Not available in API
        status: "completed",
        meetingid: item.meetingid,
        userId: item.userId
      }));
      
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
  }, [currentPage, viewType]);

  const filteredMeetings = meetings.filter(meeting =>
    meeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              </p>
            </div>
            
            {/* Search */}
            <div className="relative w-80 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#078586] w-4 h-4 z-10" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
              <Input
                placeholder="Search meetings..."
                className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg shadow-md focus:border-[#078586] focus:ring-2 focus:ring-[#078586]/20 transition-all duration-200 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMeetings.map((meeting) => (
                  <Card 
                    key={meeting.id}
                    className="cursor-pointer bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl hover:border-[#078586]/30 transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleMeetingClick(meeting.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#282F3B] text-lg leading-tight mb-3">
                            {meeting.name}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center text-[#282F3B]/70 bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-lg">
                          <Users className="w-4 h-4 mr-3 flex-shrink-0 text-[#078586]" />
                          <span className="font-medium">{meeting.participants === 0 ? "-" : `${meeting.participants} participants`}</span>
                        </div>
                        <div className="flex items-center text-[#282F3B]/70 bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-lg">
                          <User className="w-4 h-4 mr-3 flex-shrink-0 text-[#078586]" />
                          <span className="truncate font-medium">{meeting.host}</span>
                        </div>
                        <div className="flex items-center text-[#282F3B]/70 bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-lg">
                          <Calendar className="w-4 h-4 mr-3 flex-shrink-0 text-[#078586]" />
                          <span className="font-medium">{meeting.date}</span>
                        </div>
                        <div className="flex items-center text-[#282F3B]/70 bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-lg">
                          <Clock className="w-4 h-4 mr-3 flex-shrink-0 text-[#078586]" />
                          <span className="font-medium">{meeting.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/60">
                        <span className="text-sm text-[#282F3B]/70 font-medium">
                          {meeting.time}
                        </span>
                        <span className="text-sm text-[#078586] font-semibold flex items-center">
                          View Details 
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  <span className="text-sm text-[#282F3B]/70 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 p-0 rounded-lg font-medium transition-all duration-200 text-sm ${
                          currentPage === page 
                            ? "bg-[#078586] text-white shadow-lg" 
                            : "border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586]"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
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
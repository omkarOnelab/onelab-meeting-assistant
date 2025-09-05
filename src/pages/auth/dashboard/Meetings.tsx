import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Clock, 
  User, 
  ArrowRight, 
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";

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
  const pageSize = 5; // Show 5 cards per page
  const navigate = useNavigate();

  // Fetch meetings from API
  const fetchMeetings = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get<ApiResponse>(
        `http://localhost:8000/api/transcripts/?userId=5&page=${page}&pageSize=${pageSize}`
      );
      
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

  useEffect(() => {
    fetchMeetings(currentPage);
  }, [currentPage]);

  const filteredMeetings = meetings.filter(meeting =>
    meeting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMeetingClick = (meetingId: number) => {
    navigate(`/auth/meetings/${meetingId}`);
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
    <div className="flex-1 bg-surface">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-border bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Meetings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalMeetings} meetings found
              </p>
            </div>
            {/* <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-border">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div> */}
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search meetings by name or host..."
              className="pl-10 bg-surface border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading meetings...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchMeetings(currentPage)}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Meetings List */}
        {!loading && !error && (
          <>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMeetings.map((meeting) => (
                  <Card 
                    key={meeting.id}
                    className="cursor-pointer border transition-all duration-200 hover:shadow-card-hover border-border hover:border-primary/30"
                    onClick={() => handleMeetingClick(meeting.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-base leading-tight mb-2">
                            {meeting.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">
                            {meeting.status}
                          </Badge>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-3" />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{meeting.participants === 0 ? "-" : `${meeting.participants} participants`}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <User className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{meeting.host}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{meeting.date}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{meeting.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          {meeting.time}
                        </span>
                        <span className="text-xs text-primary">
                          View Details →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-white">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="border-border"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="border-border"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 p-0 ${
                          currentPage === page 
                            ? "bg-primary text-primary-foreground" 
                            : "border-border"
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
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Copy, 
  Users, 
  Calendar, 
  Clock, 
  User 
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
  summary: string;
  actionItem: string;
  transcription: string;
}

// Fetch meeting by ID from API
const getMeetingById = async (id: string): Promise<Meeting | null> => {
  try {
    // First, try to find the meeting in all pages
    let page = 1;
    let foundMeeting = null;
    
    while (page <= 10) { // Limit to 10 pages to avoid infinite loop
      const response = await axios.get<ApiResponse>(
        `http://localhost:8000/api/transcripts/?userId=5&page=${page}&pageSize=100`
      );
      
      const meeting = response.data.data.find(item => item.id === parseInt(id));
      if (meeting) {
        // Transform API data to UI format
        foundMeeting = {
          id: meeting.id,
          name: `Meeting ${meeting.meetingid}`,
          participants: 0, // Not available in API
          host: "-", // Not available in API
          date: new Date(meeting.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          time: new Date(meeting.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          duration: "-", // Not available in API
          status: "completed",
          meetingid: meeting.meetingid,
          userId: meeting.userId,
          summary: meeting.summary,
          actionItem: meeting.actionItem,
          transcription: meeting.transcription
        };
        break;
      }
      
      if (page >= response.data.totalPages) break;
      page++;
    }
    
    return foundMeeting;
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return null;
  }
};

const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) {
        setError("No meeting ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const meetingData = await getMeetingById(id);
        setMeeting(meetingData);
      } catch (err) {
        console.error('Error fetching meeting:', err);
        setError('Failed to fetch meeting details');
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Meeting Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "The meeting you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate("/auth/meetings")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Meetings
          </Button>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/auth/meetings")}
            className="mb-4 p-0 h-auto text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Meetings
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2 pr-4">
                {meeting.name}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>Host: {meeting.host}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{meeting.participants === 0 ? "-" : `${meeting.participants} participants`}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{meeting.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{meeting.duration}</span>
                </div>
              </div>
              <Badge variant="secondary" className="mt-3 text-xs bg-green-100 text-green-700 border-0">
                {meeting.status}
              </Badge>
            </div>
            
            {/* <div className="flex items-center space-x-3 flex-shrink-0">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div> */}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Summary & Action Items */}
          <div className="space-y-6">
            {/* Summary Section */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Meeting Summary</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(meeting.summary || "No summary available")}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {meeting.summary || "No summary available for this meeting."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Action Items</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(meeting.actionItem || "No action items available")}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {(() => {
                    try {
                      const actionItems = meeting.actionItem ? JSON.parse(meeting.actionItem) : [];
                      if (!Array.isArray(actionItems) || actionItems.length === 0) {
                        return (
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <p className="text-sm text-gray-500">No action items available for this meeting.</p>
                          </div>
                        );
                      }
                      
                      return actionItems.map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-1">{item.item || item.task || "Action item"}</p>
                              <p className="text-xs text-gray-500">
                                Assigned to: {item.owner || item.assignee || "Unassigned"}
                              </p>
                              {item.deadline && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Deadline: {item.deadline}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs border-0 ${
                                item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                item.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}
                            >
                              {item.priority || 'medium'}
                            </Badge>
                          </div>
                        </div>
                      ));
                    } catch (error) {
                      console.error('Error parsing action items:', error);
                      return (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">Error loading action items.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transcript */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Transcript</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(meeting.transcription || "No transcript available")}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(() => {
                  try {
                    const transcriptData = meeting.transcription ? JSON.parse(meeting.transcription) : [];
                    if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
                      return (
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500">No transcript available for this meeting.</p>
                        </div>
                      );
                    }
                    
                    return transcriptData.map((entry: any, index: number) => (
                      <div key={index} className="border-l-2 border-primary/30 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-primary">
                            {entry.socket === 1 ? "Speaker 1" : entry.socket === 2 ? "Speaker 2" : `Speaker ${entry.socket}`}
                          </p>
                          <span className="text-xs text-gray-500">
                            {entry.timestamp || `${Math.floor(index * 0.5)}:${String(index * 30 % 60).padStart(2, '0')}`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.text}</p>
                        {entry.highlight && (
                          <div className="mt-1">
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                              Highlighted
                            </Badge>
                          </div>
                        )}
                      </div>
                    ));
                  } catch (error) {
                    console.error('Error parsing transcript:', error);
                    return (
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Error loading transcript.</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;
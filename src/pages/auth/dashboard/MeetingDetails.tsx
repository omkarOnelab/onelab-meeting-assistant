import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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

// Function to convert timestamp to IST
function convertToIST(timestampMs: number): string {
  // Create Date object from the given timestamp (milliseconds)
  const date = new Date(timestampMs);
  // Options for IST formatting
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };
  // Format into IST
  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

// API Response Types
interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    userId: string;
    meetingid: string;
    transcription: string;
    summary: string;
    actionItem: Array<{
      items: string[];
      owner: string;
      deadline: string;
    }>;
    created_at: string;
  };
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
    const response = await axios.get<ApiResponse>(
      `${import.meta.env.VITE_PUBLIC_AUTH_URL}/transcripts/${id}/`
    );
    
    if (response.data.success && response.data.data) {
      const meeting = response.data.data;
      
      // Transform API data to UI format
      return {
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
        actionItem: JSON.stringify(meeting.actionItem), // Convert array to JSON string
        transcription: meeting.transcription
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return null;
  }
};

const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  // Get the current view and page parameters to preserve them in back navigation
  const currentView = searchParams.get('view') || 'my';
  const currentPage = searchParams.get('page') || '1';

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
      <div className="flex items-center justify-center p-12">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#078586]/20 border-t-[#078586] mx-auto mb-6"></div>
          <p className="text-[#282F3B] text-lg font-medium">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
          <h2 className="text-2xl font-semibold text-[#282F3B] mb-2">Meeting Not Found</h2>
          <p className="text-[#282F3B]/70 mb-6 text-lg">
            {error || "The meeting you're looking for doesn't exist."}
          </p>
          <Button 
            onClick={() => navigate(`/auth/meetings?view=${currentView}&page=${currentPage}`)}
            className="bg-[#078586] hover:bg-[#078586]/90 text-white px-6 py-3 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {currentView === 'all' ? 'All Meetings' : 'My Meetings'}
          </Button>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string, type: string = 'content') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${type} copied to clipboard!`);
      setTimeout(() => setCopyFeedback(null), 2000);
      console.log('Text copied to clipboard successfully');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback(`${type} copied to clipboard!`);
        setTimeout(() => setCopyFeedback(null), 2000);
        console.log('Text copied to clipboard using fallback method');
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
        setCopyFeedback('Failed to copy to clipboard');
        setTimeout(() => setCopyFeedback(null), 2000);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Copy Feedback */}
      {copyFeedback && (
        <div className="fixed top-4 right-4 z-50 bg-[#078586] text-white px-4 py-2 rounded-lg shadow-lg">
          {copyFeedback}
        </div>
      )}
      
      <div className="max-w-full mx-auto px-8 py-6">
        {/* Header */}
        <div className="mb-10 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/auth/meetings?view=${currentView}&page=${currentPage}`)}
            className="mb-4 px-4 py-3 h-auto text-[#282F3B] hover:text-[#078586] hover:bg-[#078586]/15 transition-all duration-200 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {currentView === 'all' ? 'All Meetings' : 'My Meetings'}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full">
          {/* Summary & Action Items */}
          <div className="space-y-6">
            {/* Summary Section */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 h-72 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Meeting Summary</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(meeting.summary || "No summary available", "Summary")}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200/30 flex-1 overflow-y-auto">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {meeting.summary || "No summary available for this meeting."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 h-72 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">Action Items</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      try {
                        let actionItems;
                        if (typeof meeting.actionItem === 'string') {
                          actionItems = JSON.parse(meeting.actionItem);
                        } else {
                          actionItems = meeting.actionItem;
                        }
                        
                        if (!Array.isArray(actionItems) || actionItems.length === 0) {
                          copyToClipboard("No action items available", "Action items");
                          return;
                        }
                        
                        const formattedActionItems = actionItems.map((item: any, index: number) => {
                          const items = item.items || item.item || item.task || ["Action item"];
                          const itemsList = Array.isArray(items) ? items : [items];
                          return `${index + 1}. ${item.owner || item.assignee || "User"}: ${itemsList.join(", ")}`;
                        }).join('\n');
                        
                        copyToClipboard(formattedActionItems, "Action items");
                      } catch (error) {
                        copyToClipboard("Error formatting action items", "Action items");
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {(() => {
                    try {
                      // Parse action items - could be JSON string or already an array
                      let actionItems;
                      if (typeof meeting.actionItem === 'string') {
                        actionItems = JSON.parse(meeting.actionItem);
                      } else {
                        actionItems = meeting.actionItem;
                      }
                      
                      if (!Array.isArray(actionItems) || actionItems.length === 0) {
                        return (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 rounded-xl text-center border border-gray-200/30">
                            <p className="text-sm text-gray-500">No action items available for this meeting.</p>
                          </div>
                        );
                      }
                      
                      return actionItems.map((item: any, index: number) => {
                        const items = item.items || item.item || item.task || ["Action item"];
                        const itemsList = Array.isArray(items) ? items : [items];
                        
                        return (
                          <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200/30 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-2">{item.owner || item.assignee || "User"}:</p>
                                <div className="space-y-1">
                                  {itemsList.map((actionItem: string, itemIndex: number) => (
                                    <p key={itemIndex} className="text-xs text-gray-500 flex items-start">
                                      <span className="text-[#078586] mr-2 mt-0.5">•</span>
                                      {actionItem}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    } catch (error) {
                      console.error('Error parsing action items:', error);
                      return (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 rounded-xl text-center border border-gray-200/30">
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
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 flex flex-col h-[600px]">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Transcript</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    try {
                      const transcriptData = meeting.transcription ? JSON.parse(meeting.transcription) : [];
                      if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
                        copyToClipboard("No transcript available", "Transcript");
                        return;
                      }
                      
                      const formattedTranscript = transcriptData.map((entry: any, index: number) => {
                        const speaker = entry.speaker || (entry.socket === 1 ? "Speaker 1" : entry.socket === 2 ? "Speaker 2" : `Speaker ${entry.socket}`);
                        const timestamp = entry.timestamp ? convertToIST(entry.timestamp) : `${Math.floor(index * 0.5)}:${String(index * 30 % 60).padStart(2, '0')}`;
                        return `[${timestamp}] ${speaker}: ${entry.text}`;
                      }).join('\n\n');
                      
                      copyToClipboard(formattedTranscript, "Transcript");
                    } catch (error) {
                      copyToClipboard("Error formatting transcript", "Transcript");
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {(() => {
                  try {
                    const transcriptData = meeting.transcription ? JSON.parse(meeting.transcription) : [];
                    if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
                      return (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 rounded-xl text-center border border-gray-200/30">
                          <p className="text-sm text-gray-500">No transcript available for this meeting.</p>
                        </div>
                      );
                    }
                    
                    return transcriptData.map((entry: any, index: number) => (
                      <div key={index} className="border-l-4 border-primary/40 pl-6 py-3 bg-gradient-to-r from-gray-50/50 to-transparent rounded-r-lg hover:shadow-sm transition-all duration-200">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-primary">
                            {entry.speaker || (entry.socket === 1 ? "Speaker 1" : entry.socket === 2 ? "Speaker 2" : `Speaker ${entry.socket}`)}
                          </p>
                          <span className="text-xs text-gray-500">
                            {entry.timestamp ? convertToIST(entry.timestamp) : `${Math.floor(index * 0.5)}:${String(index * 30 % 60).padStart(2, '0')}`}
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
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 rounded-xl text-center border border-gray-200/30">
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
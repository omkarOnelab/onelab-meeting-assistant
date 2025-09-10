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
      item: string;
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
  
  // Get the current view parameter to preserve it in back navigation
  const currentView = searchParams.get('view') || 'my';

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
          <Button 
            onClick={() => navigate(`/auth/meetings?view=${currentView}`)}
            className="px-4 py-3 text-[#282F3B] hover:text-[#078586] hover:bg-[#078586]/15 transition-all duration-200 rounded-lg"
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
            onClick={() => navigate(`/auth/meetings?view=${currentView}`)}
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
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
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
              <CardContent className="pt-0">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-6 rounded-xl border border-gray-200/30">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {meeting.summary || "No summary available for this meeting."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
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
                        
                        const formattedActionItems = actionItems.map((item: any, index: number) => 
                          `${index + 1}. ${item.owner || item.assignee || "User"}: ${item.item || item.task || "Action item"}`
                        ).join('\n');
                        
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
              <CardContent className="pt-0">
                <div className="space-y-3">
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
                      
                      return actionItems.map((item: any, index: number) => (
                        console.log("item",item),
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200/30 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 mb-1">{item.owner || item.assignee || "User"} :</p>
                              <p className="text-xs text-gray-500 flex items-start">
                                <span className="text-[#078586] mr-2 mt-0.5">•</span>
                                {item.item || item.task || "Action item"}
                              </p>
                            
                            </div>
                            
                          </div>
                        </div>
                      ));
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
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 flex flex-col">
            <CardHeader className="pb-3">
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
                        const timestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : `${Math.floor(index * 0.5)}:${String(index * 30 % 60).padStart(2, '0')}`;
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
            <CardContent className="pt-0 flex-1">
              <div className="space-y-4 min-h-96 max-h-[600px] overflow-y-auto">
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
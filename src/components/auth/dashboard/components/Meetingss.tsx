import { useState } from 'react';
import { Spin, Alert, Button, Typography, Pagination } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { Meeting } from '../../../../types/meetings';
import './Meetings.css';

const { Title } = Typography;

const Meetings = () => {
  // State for managing meeting details view
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Mock data for testing
  const mockMeetings: Meeting[] = [
    {
      id: 8,
      title: "Meeting ngp-futp-zwq",
      presenter: "-",
      date: "Sep 3, 2025",
      time: "10:07 AM",
      duration: "-",
      logo: "M",
      logoColor: "#722ed1",
      participants: [],
      transcript: {
        id: 8,
        userId: "5",
        meetingid: "ngp-futp-zwq",
        transcription: [
          { socket: 2, text: "Someone speak something. I have started this Chrome extension. Allow the", highlight: false },
          { socket: 1, text: "Okay.", highlight: false },
          { socket: 2, text: "Yes.", highlight: false },
          { socket: 1, text: "So hello? Hello. My name is Akash.", highlight: false }
        ],
        summary: "The meeting convened to discuss the quarterly performance review and strategize for the upcoming quarter. The agenda included a review of the previous quarter's metrics, identification of key challenges, and the formulation of action plans to address these challenges.",
        actionItem: [
          { item: "Revamp the marketing strategy focusing on digital channels", owner: "Marketing Team", deadline: "2024-01-15" },
          { item: "Obtain approval from upper management for the new marketing budget", owner: "Unassigned", deadline: "TBD" },
          { item: "Request timely data from the analytics team to support the new strategy", owner: "Data Analytics Team", deadline: "2024-01-05" }
        ],
        created_at: "2025-09-03T10:07:38.276Z"
      }
    },
    {
      id: 9,
      title: "Meeting ngp-futp-zwq",
      presenter: "-",
      date: "Sep 3, 2025",
      time: "10:18 AM",
      duration: "-",
      logo: "M",
      logoColor: "#722ed1",
      participants: [],
      transcript: {
        id: 9,
        userId: "5",
        meetingid: "ngp-futp-zwq",
        transcription: [
          { socket: 2, text: "Yeah, Devan. We can continue.", highlight: false },
          { socket: 1, text: "Okay. Okay. So as of now, we don't know why the summary is not coming correct.", highlight: false },
          { socket: 2, text: "Yeah. I have just changed the summary part. Let's see how it will works.", highlight: false }
        ],
        summary: "The team discussed the progress of the current project, identified bottlenecks, and brainstormed solutions to improve efficiency.",
        actionItem: [
          { item: "Investigate the root cause of the bottlenecks", owner: "Alex", deadline: "Next team meeting on Friday" },
          { item: "Implement new task management system", owner: "Sarah", deadline: "By end of the month" }
        ],
        created_at: "2025-09-03T10:18:04.974Z"
      }
    },
    {
      id: 10,
      title: "Meeting abc-123-def",
      presenter: "-",
      date: "Sep 2, 2025",
      time: "2:30 PM",
      duration: "-",
      logo: "M",
      logoColor: "#722ed1",
      participants: [],
      transcript: {
        id: 10,
        userId: "5",
        meetingid: "abc-123-def",
        transcription: [
          { socket: 1, text: "Welcome everyone to today's meeting.", highlight: false },
          { socket: 2, text: "Thank you for having me.", highlight: false }
        ],
        summary: "Brief introductory meeting to discuss project status.",
        actionItem: [
          { item: "Send meeting notes to all participants", owner: "John", deadline: "Tomorrow" }
        ],
        created_at: "2025-09-02T14:30:00.000Z"
      }
    }
  ];

  // Use mock data instead of API
  const allMeetings = mockMeetings;
  const allMeetingsLoading = false;
  const allMeetingsError = null;
  const pagination = {
    page: currentPage,
    pageSize: pageSize,
    total: mockMeetings.length,
    totalPages: Math.ceil(mockMeetings.length / pageSize)
  };

  // Handle meeting click
  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowMeetingDetails(true);
  };

  // Handle back to table view
  const handleBackToTable = () => {
    setShowMeetingDetails(false);
    setSelectedMeeting(null);
  };

  // Render meeting details view
  const renderMeetingDetails = () => {
    if (!selectedMeeting) return null;

    // Get transcript data from the selected meeting
    const transcript = selectedMeeting.transcript;
    
    // Safely parse and handle the data
    let transcriptionItems = [];
    let actionItems = [];
    let summary = '';
    
    if (transcript) {
      // Parse transcription if it's a string
      if (typeof transcript.transcription === 'string') {
        try {
          transcriptionItems = JSON.parse(transcript.transcription);
        } catch (error) {
          console.error('Error parsing transcription:', error);
          transcriptionItems = [];
        }
      } else if (Array.isArray(transcript.transcription)) {
        transcriptionItems = transcript.transcription;
      }
      
      // Parse actionItem if it's a string
      if (typeof transcript.actionItem === 'string') {
        try {
          actionItems = JSON.parse(transcript.actionItem);
        } catch (error) {
          console.error('Error parsing actionItem:', error);
          actionItems = [];
        }
      } else if (Array.isArray(transcript.actionItem)) {
        actionItems = transcript.actionItem;
      }
      
      summary = transcript.summary || '';
    }
    
    // Ensure arrays are actually arrays
    if (!Array.isArray(transcriptionItems)) {
      transcriptionItems = [];
    }
    if (!Array.isArray(actionItems)) {
      actionItems = [];
    }

    return (
      <div className="meeting-details-container">
        {/* Header with back button and meeting name */}
        <div className="meeting-details-header">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackToTable}
            className="back-button"
          >
            Back to Meetings
          </Button>
          <Title level={2} className="meeting-title">
            {selectedMeeting.title}
          </Title>
        </div>

        {/* Two sections side by side */}
        <div className="meeting-details-content">
          {/* Meeting Points Section */}
          <div className="meeting-section">
            <div className="section-header">
              <BulbOutlined className="section-icon" />
              <Title level={4} className="section-title">Meeting Points</Title>
            </div>
            <div className="section-content">
              {/* Notes Section */}
              <div className="subsection">
                <h5 className="subsection-title">Summary</h5>
                <ul className="meeting-points-list">
                  {summary ? (
                    <li>{summary}</li>
                  ) : (
                    <li>No summary available for this meeting</li>
                  )}
                </ul>
              </div>

              {/* Action Items Section */}
              <div className="subsection">
                <h5 className="subsection-title">Action Items</h5>
                <div className="action-items">
                  {actionItems.length > 0 ? (
                    actionItems.map((actionItem: any, index: number) => (
                      <div key={index} className="action-user">
                        <div className="user-name">{actionItem.owner}</div>
                        <ul className="action-list">
                          <li>{actionItem.item} - Due: {actionItem.deadline}</li>
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div className="action-user">
                      <div className="user-name">No Action Items</div>
                      <ul className="action-list">
                        <li>No action items found for this meeting</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transcripts Section */}
          <div className="meeting-section">
            <div className="section-header">
              <FileTextOutlined className="section-icon" />
              <Title level={4} className="section-title">Transcripts</Title>
            </div>
            <div className="section-content">
              <div className="transcript-content">
                {transcriptionItems.length > 0 ? (
                  transcriptionItems.map((item: any, index: number) => (
                    <div key={index} className="transcript-item">
                      <div className="speaker">Speaker {item.socket}:</div>
                      <div className="speech">{item.text}</div>
                    </div>
                  ))
                ) : (
                  <div className="transcript-item">
                    <div className="speaker">No Transcript Available</div>
                    <div className="speech">No transcript data found for this meeting</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };



  const renderAllMeetings = () => {
    // Show loading state
    if (allMeetingsLoading) {
      return (
        <div className="all-meetings-content">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        </div>
      );
    }

    // Show error state
    if (allMeetingsError) {
      return (
        <div className="all-meetings-content">
          <Alert
            message="Error Loading All Meetings"
            description={allMeetingsError}
            type="error"
            showIcon
            style={{ margin: '20px' }}
          />
        </div>
      );
    }

    // Show empty state
    if (!allMeetings || allMeetings.length === 0) {
      return (
        <div className="all-meetings-content">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3>No meetings found</h3>
              <p>There are no meetings available at the moment.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="all-meetings-content">
        <div className="meetings-table">
          <div className="meetings-table-header">
            <div className="header-cell">MEETING</div>
            <div className="header-cell">HOST</div>
            <div className="header-cell">PARTICIPANTS</div>
            <div className="header-cell">DATE</div>
            <div className="header-cell">TIME</div>
            <div className="header-cell">DURATION</div>
          </div>
          
          {allMeetings.map((meeting: Meeting) => (
            <div key={meeting.id} className="meeting-row">
              <div className="meeting-cell meeting-info">
                <div>
                  <div 
                    className="meeting-title-text clickable-title"
                    onClick={() => handleMeetingClick(meeting)}
                  >
                    {meeting.title}
                  </div>
                </div>
              </div>
              <div className="meeting-cell">
                <div className="meeting-presenter-text">{meeting.presenter}</div>
              </div>
              <div className="meeting-cell">
                <div className="meeting-participants">
                  {meeting.participants && meeting.participants.length > 0 ? (
                    <div className="participants-list">
                      {meeting.participants.slice(0, 2).map((participant, index) => (
                        <span key={index} className="participant-tag">
                          {participant}
                        </span>
                      ))}
                      {meeting.participants.length > 2 && (
                        <span className="participant-more">
                          +{meeting.participants.length - 2} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="no-participants">-</span>
                  )}
                </div>
              </div>
              <div className="meeting-cell">
                <CalendarOutlined /> {meeting.date}
              </div>
              <div className="meeting-cell">
                <ClockCircleOutlined /> {meeting.time}
              </div>
              <div className="meeting-cell">{meeting.duration}</div>
            </div>
          ))}
        </div>
        
        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pagination-container">
            <Pagination
              current={pagination.page}
              total={pagination.total}
              pageSize={pagination.pageSize}
              showSizeChanger={false}
              showQuickJumper={false}
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} meetings`
              }
              onChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="meetings-container">
      {showMeetingDetails ? renderMeetingDetails() : renderAllMeetings()}
    </div>
  );
};

export default Meetings;
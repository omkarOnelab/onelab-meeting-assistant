import { useState } from 'react';
import { Layout, Spin, Alert, Button, Typography, Pagination } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  NumberOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useMeetingsPage } from '../../../../hooks/useMeetings';
import type { Meeting, MeetingGroup } from '../../../../types/meetings';
import './Meetings.css';

const { Content } = Layout;
const { Title } = Typography;

const Meetings = () => {
  // State for managing meeting details view
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showMeetingDetails, setShowMeetingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Use the production-ready API hooks with pagination
  const {
    allMeetings,
    allMeetingsLoading,
    allMeetingsError,
    pagination,
    setPage
  } = useMeetingsPage(currentPage, pageSize);

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
          
          {allMeetings.map((group: MeetingGroup, groupIndex: number) => (
            <div key={groupIndex} className="meeting-group">
              {/* <div className="meeting-group-header">
                <Text strong>{group.dateRange} ({group.meetingCount} Meeting{group.meetingCount > 1 ? 's' : ''})</Text>
              </div> */}
              
              {group.meetings.map((meeting: Meeting) => (
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
                        <span className="no-participants">No participants</span>
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
                setPage(page);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout className="meetings-layout">
      {/* Left Sidebar */}
      {/* <Sider width={280} className="meetings-left-sider"> */}
        {/* <div className="meetings-left-content"> */}
        <NumberOutlined />

          {/* My Meetings Section */}
          {/* <VideoCameraOutlined /> */}

          {/* <div className="meetings-section">
            <div className="section-title">My Meetings</div> */}
            {/* <div 
              className={`meeting-tab ${activeTab === 'my-meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-meetings')}
            >
              <NumberOutlined />
              <span>My Meetings</span>
            </div> */}
            {/* <div 
              className={`meeting-tab ${activeTab === 'all-meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('all-meetings')}
            >
              <VideoCameraOutlined />
              <span>All Meetings</span>
            </div> */}
            {/* <div className="meeting-tab">
              <span>Shared With Me</span>
            </div> */}
          {/* </div> */}

          {/* All Channels Section */}
          {/* <div className="meetings-section">
            <div className="section-title">All channels</div>
            <div className="meeting-tab">
              <NumberOutlined />
              <span>#</span>
            </div>
            <div className="channels-info">
              <Text type="secondary">Create channels to organize your conversations.</Text>
              <Button type="primary" icon={<PlusOutlined />} className="channel-btn">
                Channel
              </Button>
            </div>
          </div> */}
        {/* </div> */}
      {/* </Sider> */}

      {/* Main Content */}
      {/* <Content className="meetings-main-content">
        {activeTab === 'my-meetings' ? renderMyMeetings() : renderAllMeetings()}
      </Content> */}

       <Content className="meetings-main-content">
        {showMeetingDetails ? renderMeetingDetails() : renderAllMeetings()}
      </Content>
      
    </Layout>
  );
};

export default Meetings;
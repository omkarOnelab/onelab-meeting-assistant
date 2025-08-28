import { useState } from 'react';
import { Typography, List, Avatar, Button, Space, Divider, Layout } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  NumberOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import './Meetings.css';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

interface Meeting {
  id: number;
  title: string;
  presenter: string;
  date: string;
  time: string;
  duration: string;
  logo: string;
  logoColor: string;
}

interface MeetingGroup {
  dateRange: string;
  meetingCount: number;
  meetings: Meeting[];
}

const Meetings = () => {
  const [activeTab, setActiveTab] = useState<'my-meetings' | 'all-meetings'>('my-meetings');

  const meetings: Meeting[] = [
    {
      id: 1,
      title: 'Fireflies AI Platform Quick Overview',
      presenter: 'Fred Fireflies',
      date: 'Thu, Aug 08 2024',
      time: '03:52 PM',
      duration: '8 mins',
      logo: 'F',
      logoColor: '#722ed1'
    }
  ];

  const allMeetings: MeetingGroup[] = [
    {
      dateRange: 'Jul 27 - Aug 2, 2025',
      meetingCount: 1,
      meetings: [
        {
          id: 1,
          title: 'DSM for Barkhappy (Nuzzl)',
          presenter: 'Yash Mahajan',
          date: 'Tue, Jul 29',
          time: '10:00 AM',
          duration: '49 mins',
          logo: 'Y',
          logoColor: '#1890ff'
        }
      ]
    },
    {
      dateRange: 'Jul 13 - Jul 19, 2025',
      meetingCount: 1,
      meetings: [
        {
          id: 2,
          title: 'Sync up call for Nuzzl (Barkhappy)',
          presenter: 'Yash Mahajan',
          date: 'Tue, Jul 15',
          time: '05:30 PM',
          duration: '51 mins',
          logo: 'Y',
          logoColor: '#1890ff'
        }
      ]
    },
    {
      dateRange: 'Jun 29 - Jul 5, 2025',
      meetingCount: 1,
      meetings: [
        {
          id: 3,
          title: 'Introductory call with HR',
          presenter: 'Yash Mahajan',
          date: 'Thu, Jul 03',
          time: '03:30 PM',
          duration: '38 mins',
          logo: 'Y',
          logoColor: '#1890ff'
        }
      ]
    },
    {
      dateRange: 'Jun 22 - Jun 28, 2025',
      meetingCount: 2,
      meetings: [
        {
          id: 4,
          title: 'DSM for Barkhappy (Nuzzl)',
          presenter: 'Yash Mahajan',
          date: 'Thu, Jun 26',
          time: '10:00 AM',
          duration: '11 mins',
          logo: 'Y',
          logoColor: '#1890ff'
        }
      ]
    }
  ];

  const renderMyMeetings = () => (
    <div className="my-meetings-content">
      <div className="meetings-list">
        <List
          dataSource={meetings}
          renderItem={(meeting) => (
            <List.Item className="meeting-list-item">
              <div className="meeting-item-content">
                <div className="meeting-logo">
                  <Avatar 
                    size={48} 
                    style={{ 
                      backgroundColor: meeting.logoColor,
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}
                  >
                    {meeting.logo}
                  </Avatar>
                </div>
                
                <div className="meeting-details">
                  <div className="meeting-title">
                    <Text strong>{meeting.title}</Text>
                  </div>
                  <div className="meeting-presenter">
                    <Text type="secondary">{meeting.presenter}</Text>
                  </div>
                </div>
                
                <div className="meeting-meta">
                  <Space direction="vertical" size="small" align="end">
                    <div className="meeting-date">
                      <CalendarOutlined /> {meeting.date}
                    </div>
                    <div className="meeting-time">
                      <ClockCircleOutlined /> {meeting.time}
                    </div>
                    <div className="meeting-duration">
                      <PlayCircleOutlined /> {meeting.duration}
                    </div>
                  </Space>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>

      <Divider />

      {/* Transcribe First Meeting Section */}
      <div className="transcribe-section">
        <div className="transcribe-graphic">
          <div className="graphic-circle">
            <div className="graphic-bars">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
        </div>
        
        <div className="transcribe-content">
          <Title level={3} className="transcribe-title">
            Transcribe your first meeting
          </Title>
          <Text className="transcribe-subtitle">
            Schedule your calendar event by inviting Fireflies, transcribing a live meeting or uploading media.
          </Text>
          
          <div className="transcribe-actions">
            <Button type="primary" size="large" icon={<CalendarOutlined />}>
              Schedule
            </Button>
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Add to live meeting
            </Button>
            <Button type="primary" size="large" icon={<UploadOutlined />}>
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllMeetings = () => (
    <div className="all-meetings-content">
      <div className="meetings-table">
        <div className="meetings-table-header">
          <div className="header-cell">MEETING</div>
          <div className="header-cell">DATE</div>
          <div className="header-cell">TIME</div>
          <div className="header-cell">DURATION</div>
        </div>
        
        {allMeetings.map((group, groupIndex) => (
          <div key={groupIndex} className="meeting-group">
            <div className="meeting-group-header">
              <Text strong>{group.dateRange} ({group.meetingCount} Meeting{group.meetingCount > 1 ? 's' : ''})</Text>
            </div>
            
            {group.meetings.map((meeting) => (
              <div key={meeting.id} className="meeting-row">
                <div className="meeting-cell meeting-info">
                  <Avatar 
                    size={32} 
                    style={{ 
                      backgroundColor: meeting.logoColor,
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginRight: '12px'
                    }}
                  >
                    {meeting.logo}
                  </Avatar>
                  <div>
                    <div className="meeting-title-text">{meeting.title}</div>
                    <div className="meeting-presenter-text">{meeting.presenter}</div>
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
    </div>
  );

  return (
    <Layout className="meetings-layout">
      {/* Left Sidebar */}
      <Sider width={280} className="meetings-left-sider">
        <div className="meetings-left-content">
          {/* My Meetings Section */}
          <div className="meetings-section">
            <div className="section-title">My Meetings</div>
            <div 
              className={`meeting-tab ${activeTab === 'my-meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-meetings')}
            >
              <NumberOutlined />
              <span>My Meetings</span>
            </div>
            <div 
              className={`meeting-tab ${activeTab === 'all-meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('all-meetings')}
            >
              <VideoCameraOutlined />
              <span>All Meetings</span>
            </div>
            <div className="meeting-tab">
              <span>Shared With Me</span>
            </div>
          </div>

          {/* All Channels Section */}
          <div className="meetings-section">
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
          </div>
        </div>
      </Sider>

      {/* Main Content */}
      <Content className="meetings-main-content">
        {activeTab === 'my-meetings' ? renderMyMeetings() : renderAllMeetings()}
      </Content>
    </Layout>
  );
};

export default Meetings;


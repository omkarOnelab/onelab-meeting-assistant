
import { Layout, Typography, Card, List, Avatar, Button, Spin, Alert } from 'antd';
import {
  CalendarOutlined,
  CheckOutlined,
  StarOutlined,
  SoundOutlined,
  WarningOutlined,
  VideoCameraOutlined,
  LockOutlined,
  MobileOutlined,
  DesktopOutlined,
  UpOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../../hooks/useAuth';
import { useDashboardPage } from '../../../../hooks/useDashboard';
import type { SummaryCard, RecentMeeting, MeetingInsight } from '../../../../types/dashboard';
import Meetings from './Meetings';
import './MainContent.css';

const { Content } = Layout;
const { Title, Text } = Typography;

interface MainContentProps {
  activeTab: string;
}

const MainContent = ({ activeTab }: MainContentProps) => {
  const { getUserFullName } = useAuth();
  const userName = getUserFullName() || 'User';

  // Use the production-ready API hooks
  const {
    summaryCards,
    summaryCardsLoading,
    summaryCardsError,
    recentMeetings,
    recentMeetingsLoading,
    recentMeetingsError,
    popularTopics,
    popularTopicsLoading,
    popularTopicsError,
    hideInsights
  } = useDashboardPage();

  // Helper function to get icon component from string
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      calendar: <CalendarOutlined />,
      check: <CheckOutlined />,
      star: <StarOutlined />,
      sound: <SoundOutlined />,
      warning: <WarningOutlined />,
      video: <VideoCameraOutlined />,
      lock: <LockOutlined />,
      mobile: <MobileOutlined />,
      desktop: <DesktopOutlined />
    };
    return iconMap[iconName] || <CalendarOutlined />;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <div className="welcome-section">
              <Title level={2}>Good Afternoon, {userName}</Title>
              <Text type="secondary">
                Did you like the new home? <a href="#feedback">Feedback</a>
              </Text>
            </div>

            {/* Summary Cards Section */}
            <div className="summary-cards">
              {summaryCardsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Spin size="large" />
                </div>
              ) : summaryCardsError ? (
                <Alert
                  message="Error Loading Summary Cards"
                  description={summaryCardsError}
                  type="error"
                  showIcon
                  style={{ margin: '20px' }}
                />
              ) : (
                summaryCards.map((card: SummaryCard) => (
                  <Card key={card.id} className="summary-card" bodyStyle={{ padding: '24px' }}>
                    <div className="card-content">
                      <div 
                        className="card-icon" 
                        style={{ 
                          color: card.color, 
                          backgroundColor: card.bgColor 
                        }}
                      >
                        {getIconComponent(card.icon)}
                      </div>
                      <div className="card-text">
                        <Title level={3} style={{ margin: 0 }}>{card.count}</Title>
                        <Text type="secondary">{card.label}</Text>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Popular Topics Section */}
            <div className="section">
              <Title level={4}>Popular Topics</Title>
              {popularTopicsLoading ? (
                <Spin />
              ) : popularTopicsError ? (
                <Alert
                  message="Error Loading Topics"
                  description={popularTopicsError}
                  type="error"
                  showIcon
                />
              ) : popularTopics.length > 0 ? (
                <List
                  dataSource={popularTopics}
                  renderItem={(topic) => (
                    <List.Item>
                      <Text strong>{topic.title}</Text>
                      <Text type="secondary">({topic.meetingCount} meetings)</Text>
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">No topics found</Text>
              )}
            </div>

            {/* Recent Meetings Section */}
            <div className="section">
              <Title level={4}>Recent Meetings</Title>
              {recentMeetingsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Spin size="large" />
                </div>
              ) : recentMeetingsError ? (
                <Alert
                  message="Error Loading Recent Meetings"
                  description={recentMeetingsError}
                  type="error"
                  showIcon
                  style={{ margin: '20px' }}
                />
              ) : (
                <List
                  dataSource={recentMeetings}
                  renderItem={(meeting: RecentMeeting) => (
                    <List.Item className="meeting-item">
                      <div className="meeting-content">
                        <div className="meeting-header">
                          <Avatar size={40} style={{ backgroundColor: meeting.avatarColor }}>
                            {meeting.avatar}
                          </Avatar>
                          <div className="meeting-info">
                            <Text strong>{meeting.title}</Text>
                            <div><Text type="secondary">{meeting.date}</Text></div>
                          </div>
                          <div className="meeting-actions">
                            <Button icon={<UpOutlined />} type="text" size="small" />
                            <Button icon={<EllipsisOutlined />} type="text" size="small" />
                          </div>
                        </div>
                        
                        {meeting.insights && meeting.insights.length > 0 && (
                          <div className="meeting-insights">
                            <List
                              size="small"
                              dataSource={meeting.insights}
                              renderItem={(insight: MeetingInsight) => (
                                <List.Item className="insight-item">
                                  <span className="insight-icon">{getIconComponent(insight.icon)}</span>
                                  <Text className="insight-text">{insight.text}</Text>
                                </List.Item>
                              )}
                            />
                            <div className="insights-footer">
                              <a 
                                href="#hide" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  hideInsights(meeting.id);
                                }}
                              >
                                Hide
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </>
        );
      
      case 'meetings':
        return <Meetings />;
      
      default:
        return (
          <div className="section">
            <Title level={4}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</Title>
            <Text>Content for {activeTab} will be displayed here</Text>
          </div>
        );
    }
  };

  return (
    <Content className="dashboard-content">
      {renderTabContent()}
    </Content>
  );
};

export default MainContent;

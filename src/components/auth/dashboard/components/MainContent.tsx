
import { Layout, Typography, Card, List, Avatar, Button } from 'antd';
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
import Meetings from './Meetings';
import './MainContent.css';

const { Content } = Layout;
const { Title, Text } = Typography;

interface MainContentProps {
  activeTab: string;
}

const MainContent = ({ activeTab }: MainContentProps) => {
  const summaryCards = [
    { icon: <CalendarOutlined />, count: 0, label: 'Meeting Preps', color: '#ff7a45', bgColor: '#fff2e8' },
    { icon: <CheckOutlined />, count: 0, label: 'Tasks', color: '#52c41a', bgColor: '#f6ffed' },
    { icon: <StarOutlined />, count: 0, label: 'AI Apps', color: '#722ed1', bgColor: '#f9f0ff' },
    { icon: <SoundOutlined />, count: 0, label: 'Soundbites', color: '#1890ff', bgColor: '#e6f7ff' }
  ];

  const recentMeetings = [
    {
      id: 1,
      title: 'DSM for Barkhappy (Nuzzl)',
      date: 'Jul 29, 10:00 AM',
      avatar: 'Y',
      avatarColor: '#1890ff',
      insights: [
        { icon: <WarningOutlined />, text: 'Content Moderation Errors: Legitimate names flagged as inappropriate indicate a need for machine learning adjustments.' },
        { icon: <VideoCameraOutlined />, text: 'Face Detection Challenges: Errors in video verification hinder user onboarding and require urgent fixes.' },
        { icon: <LockOutlined />, text: 'Security Enhancements: Automatic password changes and logout features are being integrated into the login system.' },
        { icon: <MobileOutlined />, text: 'Mobile Testing Insights: Mixed success rates in photo and video uploads across devices necessitate further evaluation.' },
        { icon: <DesktopOutlined />, text: 'Developer Issues: Email delivery problems in the developer invitation process need immediate resolution.' }
      ]
    },
    {
      id: 2,
      title: 'Sync up call for Nuzzl (Barkhappy)',
      date: 'Jul 15, 5:30 PM',
      avatar: 'Y',
      avatarColor: '#1890ff'
    },
    {
      id: 3,
      title: 'Introductory call with HR',
      date: 'Jul 03, 3:30 PM',
      avatar: 'Y',
      avatarColor: '#1890ff'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <div className="welcome-section">
              <Title level={2}>Good Afternoon, Omkar</Title>
              <Text type="secondary">
                Did you like the new home? <a href="#feedback">Feedback</a>
              </Text>
            </div>

            <div className="summary-cards">
              {summaryCards.map((card, index) => (
                <Card key={index} className="summary-card" bodyStyle={{ padding: '24px' }}>
                  <div className="card-content">
                    <div 
                      className="card-icon" 
                      style={{ 
                        color: card.color, 
                        backgroundColor: card.bgColor 
                      }}
                    >
                      {card.icon}
                    </div>
                    <div className="card-text">
                      <Title level={3} style={{ margin: 0 }}>{card.count}</Title>
                      <Text type="secondary">{card.label}</Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="section">
              <Title level={4}>Popular Topics</Title>
              <Text type="secondary">No topics found</Text>
            </div>

            <div className="section">
              <Title level={4}>Recent Meetings</Title>
              <List
                dataSource={recentMeetings}
                renderItem={(meeting) => (
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
                      
                      {meeting.insights && (
                        <div className="meeting-insights">
                          <List
                            size="small"
                            dataSource={meeting.insights}
                            renderItem={(insight) => (
                              <List.Item className="insight-item">
                                <span className="insight-icon">{insight.icon}</span>
                                <Text className="insight-text">{insight.text}</Text>
                              </List.Item>
                            )}
                          />
                          <div className="insights-footer">
                            <a href="#hide">Hide</a>
                          </div>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
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

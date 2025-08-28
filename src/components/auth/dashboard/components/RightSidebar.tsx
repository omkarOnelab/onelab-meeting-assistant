import { useState } from 'react';
import { Layout, Typography, Button, Space, Card, Avatar, List, Tag } from 'antd';
import {
  SettingOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  StopOutlined,
  SoundOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import './RightSidebar.css';

const { Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

interface RightSidebarProps {
  onSettingsClick: () => void;
  onCaptureClick: () => void;
}

const RightSidebar = ({ onSettingsClick, onCaptureClick }: RightSidebarProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleRecord = () => {
    setIsRecording(true);
    setIsPaused(false);
    onCaptureClick();
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRecording(false);
    setIsPaused(false);
  };

  const recentNotes = [
    {
      id: 1,
      title: 'Product Team Sync - Jul 29',
      content: 'Discussed Q3 roadmap and upcoming feature releases...',
      date: '2 hours ago',
      tags: ['meeting', 'product', 'roadmap']
    },
    {
      id: 2,
      title: 'Design Review - Jul 28',
      content: 'Reviewed new UI components and design system updates...',
      date: '1 day ago',
      tags: ['design', 'ui', 'review']
    }
  ];

  return (
    <Sider width={320} className="dashboard-right-sider">
      <div className="right-sider-content">
        {/* Header */}
        <div className="right-sider-header">
          <Title level={4}>Fireflies Notetaker</Title>
          <Button 
            icon={<SettingOutlined />} 
            type="text" 
            onClick={onSettingsClick}
            className="settings-btn"
          />
        </div>

        {/* Recording Controls */}
        <div className="recording-section">
          <Card className="recording-card">
            <div className="recording-status">
              <div className={`status-indicator ${isRecording ? 'recording' : 'stopped'}`} />
              <Text strong>
                {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Not Recording'}
              </Text>
            </div>
            
            <Space className="recording-controls">
              {!isRecording ? (
                <Button 
                  type="primary" 
                  icon={<VideoCameraOutlined />}
                  onClick={handleRecord}
                  className="record-btn"
                >
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button 
                    icon={isPaused ? <PlayCircleOutlined /> : <PauseOutlined />}
                    onClick={handlePause}
                    className="pause-btn"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button 
                    icon={<StopOutlined />}
                    onClick={handleStop}
                    className="stop-btn"
                  >
                    Stop
                  </Button>
                </>
              )}
            </Space>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <Title level={5}>Quick Actions</Title>
          <Space direction="vertical" size="small" className="action-buttons">
            <Button 
              icon={<SoundOutlined />} 
              block 
              className="action-btn"
            >
              Transcribe Audio
            </Button>
            <Button 
              icon={<FileTextOutlined />} 
              block 
              className="action-btn"
            >
              Upload Document
            </Button>
            <Button 
              icon={<CalendarOutlined />} 
              block 
              className="action-btn"
            >
              Schedule Meeting
            </Button>
          </Space>
        </div>

        {/* Recent Notes */}
        <div className="recent-notes">
          <Title level={5}>Recent Notes</Title>
          <List
            dataSource={recentNotes}
            renderItem={(note) => (
              <List.Item className="note-item">
                <Card size="small" className="note-card">
                  <div className="note-header">
                    <Text strong className="note-title">{note.title}</Text>
                    <Text type="secondary" className="note-date">{note.date}</Text>
                  </div>
                  <Paragraph className="note-content" ellipsis={{ rows: 2 }}>
                    {note.content}
                  </Paragraph>
                  <div className="note-tags">
                    {note.tags.map((tag, index) => (
                      <Tag key={index} className="note-tag">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>

        {/* Team Activity */}
        <div className="team-activity">
          <Title level={5}>Team Activity</Title>
          <div className="activity-item">
            <Avatar size="small" icon={<UserOutlined />} />
            <div className="activity-content">
              <Text strong>Sarah</Text>
              <Text type="secondary"> joined meeting "Weekly Standup"</Text>
              <div className="activity-time">
                <ClockCircleOutlined /> 5 min ago
              </div>
            </div>
          </div>
          <div className="activity-item">
            <Avatar size="small" icon={<UserOutlined />} />
            <div className="activity-content">
              <Text strong>Mike</Text>
              <Text type="secondary"> shared notes from "Design Review"</Text>
              <div className="activity-time">
                <ClockCircleOutlined /> 1 hour ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default RightSidebar;

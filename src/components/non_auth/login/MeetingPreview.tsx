
import { Card, Avatar, Tag, Typography, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const MeetingPreview = () => {
  return (
    <Space direction="vertical" size="large" className="meeting-preview-space">
      {/* Meeting Card */}
      <Card
        title={
          <div className="meeting-card-title">
            <CalendarOutlined style={{ color: '#ff69b4', fontSize: '18px' }} />
            <span className="meeting-card-title-text">
              Product Team Sync
            </span>
          </div>
        }
        extra={
          <Text className="meeting-card-extra">
            Feb 24 • 09:00 AM - 09:45 AM
          </Text>
        }
        className="meeting-card"
        headStyle={{ 
          borderBottom: '1px solid #333',
          padding: '16px 20px'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        {/* Meeting Summary */}
        <div style={{ marginBottom: '20px' }}>
          <Title level={4} className="meeting-summary-title">
            Meeting Summary
          </Title>
          
          {/* Tags */}
          <div className="meeting-tags">
            <Space wrap size="small">
              <Tag color="#ff69b4" style={{ borderRadius: '16px', border: 'none' }}>
                Onelab meeting assistant
              </Tag>
              <Tag color="#00cc00" style={{ borderRadius: '16px', border: 'none' }}>
                AI notetaker
              </Tag>
              <Tag color="#ff9900" style={{ borderRadius: '16px', border: 'none' }}>
                Meetings
              </Tag>
              <Tag color="#cc33ff" style={{ borderRadius: '16px', border: 'none' }}>
                Horizontal approach
              </Tag>
              <Tag color="#cc33ff" style={{ borderRadius: '16px', border: 'none' }}>
                Product-led growth
              </Tag>
            </Space>
          </div>
          
          <Paragraph className="meeting-summary-text">
            In the meeting, Devam and Akash discuss the growth of Onelab meeting assistant, an AI notetaker th...
          </Paragraph>
        </div>

        {/* Outline */}
        <div style={{ marginBottom: '20px' }}>
          <Title level={4} className="outline-title">
            Outline
          </Title>
          <div className="outline-content">
            <div className="outline-item">
              <Text className="outline-item-title">1. Introduction</Text>
              <Text className="outline-item-time">
                04:48 - 10:32
              </Text>
            </div>
            <ul className="outline-list">
              <li>Devam acknowledges Onelab meeting assistant and its growth</li>
              <li>Akash invited to share the origin story of Onelab meeting assistant</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Testimonial Card */}
      <Card
        className="testimonial-card"
        bodyStyle={{ padding: '20px' }}
      >
        <div className="testimonial-content">
          {/* Vercel Branding */}
          <div className="vercel-branding">
            <div className="vercel-icon">
              <div className="vercel-triangle" />
            </div>
            <Text className="vercel-text">
              Onelab meeting assistant
            </Text>
          </div>
          
          {/* Quote */}
          <Paragraph className="testimonial-quote">
            "Onelab meeting assistant keeps me 100% present in meetings without losing any of the details."
          </Paragraph>
          
          {/* Author */}
          <div className="testimonial-author">
            <Avatar 
              style={{ 
                backgroundColor: '#ff69b4',
                verticalAlign: 'middle'
              }} 
              size="large"
            >
              RD
            </Avatar>
            <div className="testimonial-author-info">
              <Text className="testimonial-author-name">
                Rahul Dangi
              </Text>
              <div>
                <Text className="testimonial-author-title">
                  Head of Growth
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Space>
  );
};

export default MeetingPreview;

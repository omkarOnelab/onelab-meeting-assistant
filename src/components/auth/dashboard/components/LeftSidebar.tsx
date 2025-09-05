
import { Layout, Typography, Avatar, Button } from 'antd';
import {
  // HomeOutlined,
  VideoCameraOutlined,
  // SoundOutlined,
  // UploadOutlined,
  // MoreOutlined,
  // AppstoreOutlined,
  // BarChartOutlined,
  // StarOutlined,
  // TeamOutlined,
  // CrownOutlined,
  // SettingOutlined
} from '@ant-design/icons';
import './LeftSidebar.css';

const { Sider } = Layout;
const { Title, Text } = Typography;

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

interface LeftSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const LeftSidebar = ({ activeTab, onTabChange }: LeftSidebarProps) => {
  const navigationItems: NavigationItem[] = [
    // { icon: <HomeOutlined />, label: 'Home', active: activeTab === 'home' },
    { icon: <VideoCameraOutlined />, label: 'Meetings', active: activeTab === 'meetings' },
    // { icon: <SoundOutlined />, label: 'Meeting Status', active: activeTab === 'meeting-status' },
    // { icon: <UploadOutlined />, label: 'Uploads', active: activeTab === 'uploads' },
    // { icon: <AppstoreOutlined />, label: 'Integrations', active: activeTab === 'integrations' },
    // { icon: <BarChartOutlined />, label: 'Analytics', active: activeTab === 'analytics' },
    // { icon: <StarOutlined />, label: 'AI Apps', active: activeTab === 'ai-apps' },
    // { icon: <TeamOutlined />, label: 'Team', active: activeTab === 'team' },
    // { icon: <CrownOutlined />, label: 'Upgrade', active: activeTab === 'upgrade' },
    // { icon: <SettingOutlined />, label: 'Settings', active: activeTab === 'settings' },
    // { icon: <MoreOutlined />, label: 'More', active: activeTab === 'more' }
  ];

  const handleTabClick = (label: string) => {
    const tabKey = label.toLowerCase().replace(/\s+/g, '-');
    onTabChange(tabKey);
  };

  return (
    <Sider width={280} className="dashboard-sider">
      <div className="sider-header">
        <Title level={3} className="logo">Onelab AI</Title>
      </div>
      
      <div className="sider-content">
        <nav className="navigation">
          {navigationItems.map((item, index) => (
            <div 
              key={index} 
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={() => handleTabClick(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </nav>
        
        {/* <div className="team-section">
          <div className="team-card">
            <div className="team-info">
              <Avatar size={32} style={{ backgroundColor: '#52c41a' }}>R</Avatar>
              <div>
                <Text strong>Rahul's Team</Text>
                <div><Text type="secondary">10 teammates</Text></div>
              </div>
            </div>
            <Button type="primary" size="small">Request to join</Button>
          </div>
        </div> */}
      </div>
    </Sider>
  );
};

export default LeftSidebar;

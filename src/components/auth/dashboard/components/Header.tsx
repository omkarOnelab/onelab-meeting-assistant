
import { Layout, Input, Button, Badge, Avatar, Popover, Progress, Tooltip } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  DownOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  SettingOutlined,
  MobileOutlined,
  SafetyOutlined,
  LogoutOutlined,
  AudioOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Typography } from 'antd';
import { useAuth } from '../../../../hooks/useAuth';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onSearch: (value: string) => void;
  onUpgrade: () => void;
  onCapture: () => void;
  userName?: string;
}

const Header = ({ onSearch, onUpgrade, onCapture, userName }: HeaderProps) => {
  const { logout, getUserEmail } = useAuth();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .filter(Boolean)
        .map((name) => name[0])
        .join('')
        .toUpperCase();
    }
    return 'U';
  };

  const profileContent = (
    <div className="profile-popover">
      <div className="profile-section">
        <div className="profile-greeting">Hi {userName || 'User'}</div>
        <div className="profile-email">{getUserEmail()}</div>
      </div>

      {/* <div className="profile-card">
        <div className="profile-card-row">
          <div className="profile-card-title">Free</div>
          <Progress percent={100} showInfo={false} size="small" strokeColor="#22c55e" />
          <div className="profile-card-meta">3 left / 3 free meetings</div>
          <Button type="primary" block className="upgrade-inline-btn" icon={<ThunderboltOutlined />} onClick={onUpgrade}>
            Upgrade
          </Button>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-row">
          <div className="profile-card-title">Storage</div>
          <Progress percent={100} showInfo={false} size="small" strokeColor="#22c55e" />
          <div className="profile-card-meta">800 left / 800 mins</div>
        </div>
      </div> */}

      <div className="profile-menu">
        {/* <div className="profile-menu-item">
          <GiftOutlined />
          <span>Refer and Earn $5</span>
        </div>
        <div className="profile-menu-item">
          <SettingOutlined />
          <span>Settings</span>
        </div>
        <div className="profile-menu-item">
          <MobileOutlined />
          <span>Manage Devices</span>
        </div>
        <div className="profile-menu-item">
          <SafetyOutlined />
          <span>Platform rules</span>
        </div> */}
        <div className="profile-menu-item logout" onClick={logout}>
          <LogoutOutlined />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );

  return (
    <AntHeader className="dashboard-header">
      <div className="header-left">
        {/* <Input
          placeholder="Q Search by title or keyword"
          prefix={<SearchOutlined />}
          className="search-input"
          onChange={handleSearch}
        /> */}
      </div>
      
      <div className="header-right">
        {/* <Text className="free-meetings">3 Free meetings</Text> */}
        {/* <Button type="primary" className="upgrade-btn" onClick={onUpgrade}>
          Upgrade
        </Button>
        <Button type="primary" className="capture-btn" onClick={onCapture}>
          Capture <DownOutlined />
        </Button> */}
        {/* Purple audio/mic icon to match screenshot */}
        {/* <Button icon={<AudioOutlined />} className="icon-btn" style={{ color: '#722ED1' }} /> */}
        {/* Notification bell with dot */}
        {/* <Badge dot> */}
        <Tooltip
          title={"Install the extension"}
          placement="bottom"
        >
          <Button
            icon={<AppstoreOutlined />}
            className="icon-btn"
            aria-label={"Install the extension"}
          />
        </Tooltip>
        {/* </Badge> */}

        <Badge dot>
          <Button icon={<BellOutlined />} className="icon-btn" />
        </Badge>
        
        {/* Remove extra user icon button to match screenshot spacing */}
        <Popover content={profileContent} trigger="click" placement="bottomRight" overlayClassName="profile-popover-wrapper">
          <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
            <Avatar 
              size={32} 
              style={{ 
                backgroundColor: '#1890ff',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {getUserInitials()}
            </Avatar>
            {/* Hide inline user name to match screenshot */}
          </span>
        </Popover>
      </div>
    </AntHeader>
  );
};

export default Header;

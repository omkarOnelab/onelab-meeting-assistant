
import { Layout, Input, Button, Badge, Avatar } from 'antd';
import {
  SearchOutlined,
  VideoCameraOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Typography } from 'antd';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  onSearch: (value: string) => void;
  onUpgrade: () => void;
  onCapture: () => void;
}

const Header = ({ onSearch, onUpgrade, onCapture }: HeaderProps) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <AntHeader className="dashboard-header">
      <div className="header-left">
        <Input
          placeholder="Q Search by title or keyword"
          prefix={<SearchOutlined />}
          className="search-input"
          onChange={handleSearch}
        />
      </div>
      
      <div className="header-right">
        <Text className="free-meetings">3 Free meetings</Text>
        <Button type="primary" className="upgrade-btn" onClick={onUpgrade}>
          Upgrade
        </Button>
        <Button type="primary" className="capture-btn" onClick={onCapture}>
          Capture <DownOutlined />
        </Button>
        <Button icon={<VideoCameraOutlined />} className="icon-btn" />
        <Badge count={1}>
          <Button icon={<BellOutlined />} className="icon-btn" />
        </Badge>
        <Badge count={0} color="green">
          <Button icon={<UserOutlined />} className="icon-btn" />
        </Badge>
        <Avatar size={32} icon={<UserOutlined />} />
      </div>
    </AntHeader>
  );
};

export default Header;

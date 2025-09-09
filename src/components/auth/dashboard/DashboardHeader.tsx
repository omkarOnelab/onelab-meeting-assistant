import { Button, Dropdown, Avatar, Space } from 'antd';
import type { MenuProps } from 'antd';
import { User, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../../../redux/slice/authSlice';
import type { RootState } from '../../../redux/store';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    // Clear auth state and navigate to login page
    dispatch(clearAuth());
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate("non-auth/login");
  };

  // Get user display name and email
  const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'User';
  const userEmail = user?.email || 'user@example.com';
  const userInitials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={16} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{userName}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{userEmail}</div>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
          <LogOut size={16} />
          Log out
        </span>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <header style={{
      height: 64,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end'
    }}>
      <Space size="middle">
        {/* Add Extension Button */}
        <Button 
          type="default" 
          icon={<Plus size={16} />}
          onClick={() => window.open('https://onelab-meet-assistant.s3.eu-north-1.amazonaws.com/Extension/medtech-extensions.zip')}
        >
          Add Extension
        </Button>

        {/* Profile Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar 
              style={{ backgroundColor: '#e6fffa', color: '#2dd4bf' }}
            >
              {userInitials}
            </Avatar>
            <div style={{ display: 'none' }} className="sm:block">
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>{userName}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{userEmail}</div>
            </div>
          </div>
        </Dropdown>
      </Space>
    </header>
  );
};

export default DashboardHeader;
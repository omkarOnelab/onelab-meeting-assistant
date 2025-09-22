import { useState, useEffect } from 'react';
import { Button, Dropdown, Avatar, Space, message } from 'antd';
import type { MenuProps } from 'antd';
import { User, LogOut, Plus, Calendar, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '../../../redux/slice/authSlice';
import type { RootState } from '../../../redux/store';
import { useCalendar } from '../../../hooks/useCalendar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { hasAuthorization, checkAuthorization, loading: calendarLoading } = useCalendar();
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [isCheckingCalendar, setIsCheckingCalendar] = useState(false);
  const [lastCalendarCheck, setLastCalendarCheck] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  // Refresh calendar status when component mounts and user is authenticated
  useEffect(() => {
    if (user && user.id) {
      // Only check if we haven't checked recently (within last 30 seconds)
      const now = Date.now();
      if (now - lastCalendarCheck > 30000) {
        // Small delay to ensure auth state is fully loaded
        const timer = setTimeout(() => {
          checkAuthorization();
          setLastCalendarCheck(now);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, checkAuthorization, lastCalendarCheck]);

  const handleLogout = () => {
    // Clear auth state and navigate to login page
    dispatch(clearAuth());
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate("non-auth/login");
  };

  const handleAddExtension = async () => {
    // Prevent multiple simultaneous calls and rapid clicking
    const now = Date.now();
    if (isCheckingCalendar || calendarLoading || (now - lastClickTime < 1000)) {
      return;
    }
    
    setLastClickTime(now);

    try {
      // Show loader immediately
      setIsCheckingCalendar(true);
      
      // Check if we already have recent calendar status
      if (now - lastCalendarCheck < 10000 && hasAuthorization) {
        // We have recent data and authorization - proceed directly
        setIsCheckingCalendar(false);
        window.open('https://onelab-meet-assistant.s3.eu-north-1.amazonaws.com/Extension/medtech-extensions.zip');
        message.success('Extension download started!');
        return;
      }
      
      // If calendar is currently loading, wait for it to complete
      if (calendarLoading) {
        // Wait for calendar loading to complete
        let waitTime = 0;
        const maxWaitTime = 5000; // 5 seconds max wait
        
        while (calendarLoading && waitTime < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 200));
          waitTime += 200;
        }
      }
      
      // Single check for calendar authorization
      await checkAuthorization();
      setLastCalendarCheck(now);
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Hide loader
      setIsCheckingCalendar(false);
      
      if (!hasAuthorization) {
        // Calendar not connected - show popup dialog
        setShowCalendarDialog(true);
        return;
      }
      
      // Calendar is connected - proceed with extension download
      window.open('https://onelab-meet-assistant.s3.eu-north-1.amazonaws.com/Extension/medtech-extensions.zip');
      message.success('Extension download started!');
      
    } catch (error) {
      console.error('Error checking calendar status:', error);
      setIsCheckingCalendar(false);
      message.error('Failed to check calendar connection status');
    }
  };

  const handleConnectCalendar = () => {
    setShowCalendarDialog(false);
    navigate('/auth/dashboard');
    
    // Scroll to calendar section and highlight it
    setTimeout(() => {
      const calendarSection = document.querySelector('[data-calendar-section]');
      if (calendarSection) {
        calendarSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight effect
        calendarSection.classList.add('animate-pulse', 'ring-4', 'ring-[#078586]', 'ring-opacity-50');
        
        // Remove highlight after 3 seconds
        setTimeout(() => {
          calendarSection.classList.remove('animate-pulse', 'ring-4', 'ring-[#078586]', 'ring-opacity-50');
        }, 3000);
      }
    }, 100);
  };

  // Get user display name and email
  const userName = user ? `${user.first_name} ${user.last_name}`.trim() : 'User';
  const userEmail = user?.email || 'user@ .com';
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
          icon={isCheckingCalendar || calendarLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-[#078586]"></div> : <Plus size={16} />}
          onClick={handleAddExtension}
          loading={isCheckingCalendar || calendarLoading}
          disabled={isCheckingCalendar || calendarLoading}
        >
          {isCheckingCalendar 
            ? 'Checking...' 
            : calendarLoading 
              ? 'Loading Calendar...' 
              : 'Add Extension'
          }
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

      {/* Calendar Connection Required Dialog */}
      <AlertDialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <AlertDialogContent className="sm:max-w-md bg-white border border-gray-200/60 shadow-xl">
          <AlertDialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-[#078586]/10 rounded-full">
                <AlertCircle className="w-6 h-6 text-[#078586]" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-[#282F3B]">
                Calendar Connection Required
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-[#282F3B]/70 leading-relaxed">
              Please connect your Google Calendar first to use the extension. The extension needs access to your calendar to function properly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={() => setShowCalendarDialog(false)}
              className="w-full sm:w-auto border-[#282F3B]/20 text-[#282F3B] hover:bg-[#282F3B]/5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConnectCalendar}
              className="w-full sm:w-auto bg-[#078586] hover:bg-[#078586]/90 text-white border-0"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Connect Calendar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
};

export default DashboardHeader;
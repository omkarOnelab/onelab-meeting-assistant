import { useState, useEffect } from 'react';
import { Button, Typography, Space, Card, Switch, message } from 'antd';
import { GoogleOutlined, WindowsOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../../hooks/useAuth';
import { setUserFromBackend } from '../../../redux/slice/authSlice';

import './Login.css';

/*
  AUTH FLOW SWITCH - READ ME (MOCK vs PROD)
  ------------------------------------------------------
  CURRENT: MOCK flow active. Clicking "Continue with Google" uses static user data
  and redirects to Dashboard, storing tokens and redux state.

  TO ENABLE PROD FLOW (when backend + Google OAuth are ready):
  1) Uncomment imports:
     - import { useGoogleLogin } from '@react-oauth/google';
     - import axios from 'axios';                       (see the commented import below)
  2) Uncomment the entire loginWithGoogle block (see "PROD Google OAuth handler" section)
  3) In the Google button onClick, replace handleMockGoogleLogin with loginWithGoogle()
  4) Ensure env vars are set:
     - VITE_GOOGLE_CLIENT_ID
     - VITE_PUBLIC_AUTH_URL (e.g., https://api.your-backend.com)
  5) In Google Cloud Console → OAuth client, add Authorized JavaScript origins:
     - Your exact dev origin (e.g., http://localhost:5173)
     - Your production domain
  6) Optionally pin Vite to a stable port in dev (e.g., 5173) to avoid uri mismatch

  DO NOT delete the commented code; it is the production-ready logic.
*/

const { Title, Paragraph, Text } = Typography;

const LoginForm = () => {
  const [showCalendarInfo, setShowCalendarInfo] = useState(false);
  const { loginWithMicrosoft, isLoading, error, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // PROD FLOW: uncomment when enabling backend integration
  // import axios from 'axios';
  // console.log("import.meta.env.VITE_PUBLIC_AUTH_URL:", import.meta.env.VITE_PUBLIC_AUTH_URL);

  // ===================== PROD Google OAuth handler (ACTIVE) =====================
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/api/user/google-login/',
          { token: tokenResponse.access_token },
          { withCredentials: true }
        );
        
        if (response?.data?.success && response?.data?.data) {
          localStorage.setItem('token', response.data.data.access);
          localStorage.setItem('refreshToken', response.data.data.refresh);
          dispatch(setUserFromBackend(response.data));
          message.success('Successfully logged in with Google!');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error:', error);
        message.error('Google login failed');
      }
    },
    onError: error => {
      console.error('Login Failed:', error);
      message.error('Google login failed');
    },
  });
  // ========================================================================================

  // ===================== MOCK Google login (FALLBACK) =====================
  // This function is kept as a fallback but not currently used
  // const handleMockGoogleLogin = async () => { ... };
  // =====================================================================

  const handleMicrosoftLogin = async () => {
    try {
      const microsoftResponse = {
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token',
      };

      const result = await loginWithMicrosoft(microsoftResponse);
      if (result.success) {
        message.success('Successfully logged in with Microsoft!');
      } else {
        message.error(result.error || 'Microsoft login failed');
      }
    } catch (error) {
      message.error('Microsoft login failed');
    }
  };

  // Clear error when component mounts or when error changes
  useEffect(() => {
    if (error) {
      clearAuthError();
    }
  }, [error, clearAuthError]);

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Logo */}
      <div className="logo-container">
        <div className="logo-wrapper">
          <div className="logo-icon">O</div>
          <span className="logo-text">Onelab meeting assistant</span>
        </div>
      </div>

      {/* Main Heading */}
      <Title level={1} className="main-heading">
        Automate your meeting notes
      </Title>

      {/* Subtitle */}
      <Paragraph className="subtitle">
        Transcribe, summarize, search, and analyze all your voice conversations.
      </Paragraph>

      {/* Authentication Buttons */}
      <Space direction="vertical" size="middle" className="auth-buttons">
        {/* TEMPORARY: Using mock login until Google OAuth is configured */}
        <Button
          icon={<GoogleOutlined />}
          size="large"
          className="auth-button google"
          onClick={() => loginWithGoogle()}
          loading={isLoading}
        >
          Continue with Google
        </Button>

        {/* <Button
          icon={<WindowsOutlined />}
          size="large"
          className="auth-button microsoft"
          onClick={handleMicrosoftLogin}
          loading={isLoading}
        >
          Continue with Microsoft
        </Button> */}
      </Space>

      {/* Calendar Access Link with Hover Info */}
      <div className="calendar-link">
        <Text
          className="calendar-link-text"
          onMouseEnter={() => setShowCalendarInfo(true)}
          onMouseLeave={() => setShowCalendarInfo(false)}
        >
          Why does Onelab meeting assistant require access to my calendar?
        </Text>

        {/* Hover Info Card */}
        {showCalendarInfo && (
          <div className="hover-info-card">
            <Card className="hover-card" bodyStyle={{ padding: '20px' }}>
              <div className="hover-card-content">
                {/* Left Section - Text Info */}
                <div className="hover-card-left">
                  <Title level={4} className="hover-card-title">
                    Effortlessly transcribe your meetings.
                  </Title>
                  <Paragraph className="hover-card-text">
                    Onelab meeting assistant syncs your calendar events containing web-conferencing links.
                  </Paragraph>
                  <Paragraph className="hover-card-text">
                    You can easily <Text className="highlight-text">select meetings</Text> that you want Onelab to join and transcribe or set to <Text className="highlight-text">automatically transcribe meetings</Text>.
                  </Paragraph>
                </div>

                {/* Right Section - Meeting Previews */}
                <div className="hover-card-right">
                  <div className="meeting-previews-container">
                    <div className="meeting-previews-list">
                      {/* Meeting Card 1 */}
                      <div className="meeting-preview-card">
                        <div className="meeting-preview-info">
                          <CalendarOutlined style={{ color: '#ff69b4', fontSize: '16px' }} />
                          <div>
                            <Text className="meeting-preview-title">Website Redesign Discussion</Text>
                            <Text className="meeting-preview-time">Feb 25 - 10:00 AM - 11:00 AM</Text>
                          </div>
                        </div>
                        <Switch defaultChecked style={{ backgroundColor: '#ff69b4' }} size="small" />
                      </div>

                      {/* Meeting Card 2 */}
                      <div className="meeting-preview-card">
                        <div className="meeting-preview-info">
                          <CalendarOutlined style={{ color: '#ff69b4', fontSize: '16px' }} />
                          <div>
                            <Text className="meeting-preview-title">Product Team Sync</Text>
                            <Text className="meeting-preview-time">Feb 24 - 08:00 AM - 08:45 AM</Text>
                          </div>
                        </div>
                        <Switch defaultChecked={false} style={{ backgroundColor: '#6c757d' }} size="small" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Security Badge */}
      <div className="security-badge">
        <LockOutlined style={{ color: '#fff' }} />
        <Text className="security-badge-text">Secured by 256-bit AES and 256-bit SSL/TLS encryption</Text>
      </div>

      {/* Terms and Privacy */}
      <div className="terms-privacy">
        <Text className="terms-text">
          By signing up, I agree to Onelab meeting assistant's <Text className="terms-link">Terms of Service</Text>, <Text className="terms-link">Privacy Policy</Text>, and <Text className="terms-link">Data Processing Terms</Text>. Security is our top priority. <Text className="terms-link">Read</Text> about the steps we take to ensure security.
        </Text>
      </div>
    </div>
  );
};

export default LoginForm;

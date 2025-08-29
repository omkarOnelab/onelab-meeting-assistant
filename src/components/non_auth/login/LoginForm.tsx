import { useState, useEffect } from 'react';
import { Button, Typography, Space, Card, Switch, message } from 'antd';
import { GoogleOutlined, WindowsOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import './Login.css';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const { Title, Paragraph, Text } = Typography;

const LoginForm = () => {
  const [showCalendarInfo, setShowCalendarInfo] = useState(false);
  const { loginWithMicrosoft, isLoading, error, clearAuthError } = useAuth();
  const navigate = useNavigate();

  console.log("import.meta.env.VITE_PUBLIC_AUTH_URL: ",import.meta.env.VITE_PUBLIC_AUTH_URL)
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
     
        const response = await axios.post(
          `${import.meta.env.VITE_PUBLIC_AUTH_URL}/user/google-login/`,
          {
            token: tokenResponse.access_token,
          },
          { withCredentials: true }
        );

        console.log("response: ", response)
        console.log("user: ",response?.data?.user)

        if (response?.data?.success) {
          const payload = {
            isAuthenticated: true,
            isLoading: false,
            user: response?.data?.user,
          };
          // dispatch(setUserProfile(payload));

          // navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    onError: error => {
      console.error('Login Failed:', error);
    },
  });

  const handleGoogleLogin = async () => {
    try {
      // This would integrate with Google OAuth
      // For now, we'll simulate the response
      const googleResponse = {
        credential: 'mock-google-credential',
        clientId: 'mock-client-id'
      };
      
      // const result = await loginWithGoogle(googleResponse);
      // if (result.success) {
      //   message.success('Successfully logged in with Google!');
      // } else {
      //   message.error(result.error || 'Google login failed');
      // }
    } catch (error) {
      message.error('Google login failed');
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      // This would integrate with Microsoft OAuth
      // For now, we'll simulate the response
      const microsoftResponse = {
        accessToken: 'mock-access-token',
        idToken: 'mock-id-token'
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
          <div className="logo-icon">
            O
          </div>
          <span className="logo-text">
            Onelab meeting assistant
          </span>
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
        <Button
          icon={<GoogleOutlined />}
          size="large"
          className="auth-button google"
          onClick={() => loginWithGoogle()}
           loading={isLoading}
        >
          Continue with Google
        </Button>
        
        <Button
          icon={<WindowsOutlined />}
          size="large"
          className="auth-button microsoft"
          onClick={handleMicrosoftLogin}
          loading={isLoading}
        >
          Continue with Microsoft
        </Button>
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
            <Card
              className="hover-card"
              bodyStyle={{ padding: '20px' }}
            >
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
                            <Text className="meeting-preview-title">
                              Website Redesign Discussion
                            </Text>
                            <Text className="meeting-preview-time">
                              Feb 25 - 10:00 AM - 11:00 AM
                            </Text>
                          </div>
                        </div>
                        <Switch 
                          defaultChecked 
                          style={{ backgroundColor: '#ff69b4' }}
                          size="small"
                        />
                      </div>

                      {/* Meeting Card 2 */}
                      <div className="meeting-preview-card">
                        <div className="meeting-preview-info">
                          <CalendarOutlined style={{ color: '#ff69b4', fontSize: '16px' }} />
                          <div>
                            <Text className="meeting-preview-title">
                              Product Team Sync
                            </Text>
                            <Text className="meeting-preview-time">
                              Feb 24 - 08:00 AM - 08:45 AM
                            </Text>
                          </div>
                        </div>
                        <Switch 
                          defaultChecked={false}
                          style={{ backgroundColor: '#6c757d' }}
                          size="small"
                        />
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
        <Text className="security-badge-text">
          Secured by 256-bit AES and 256-bit SSL/TLS encryption
        </Text>
      </div>

      {/* Terms and Privacy */}
      <div className="terms-privacy">
        <Text className="terms-text">
          By signing up, I agree to Onelab meeting assistant's{' '}
          <Text className="terms-link">
            Terms of Service
          </Text>
          ,{' '}
          <Text className="terms-link">
            Privacy Policy
          </Text>
          , and{' '}
          <Text className="terms-link">
            Data Processing Terms
          </Text>
          . Security is our top priority.{' '}
          <Text className="terms-link">
            Read
          </Text>{' '}
          about the steps we take to ensure security.
        </Text>
      </div>
    </div>
  );
};

export default LoginForm;

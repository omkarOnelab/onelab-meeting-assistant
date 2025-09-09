import { useEffect } from 'react';
import { Button, Typography, Space, Card, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
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
          navigate('/auth/meetings?view=my');
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
    <div className="login-form-container">
      {/* Login Card */}
      <Card className="login-card">
        <div className="login-card-content">
          {/* Welcome Heading */}
          <Title level={2} className="welcome-heading">
            Welcome Back
          </Title>
          
          {/* Subheading */}
          <Paragraph className="welcome-subheading">
            Sign in to access your meeting dashboard
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
              size="large"
              className="auth-button enterprise"
              onClick={handleMicrosoftLogin}
              loading={isLoading}
            >
              SECURE ENTERPRISE LOGIN
            </Button>
          </Space>

          {/* Security Footer */}
          <div className="security-footer">
            <Text className="security-text">
              Protected by enterprise-grade security and encryption
            </Text>
          </div>

          {/* Terms and Privacy */}
          <div className="terms-privacy">
            <Text className="terms-text">
              <Text className="terms-link">Terms of Service</Text> • <Text className="terms-link">Privacy Policy</Text>
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Shield, Users, Zap, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { setUserFromBackend } from '../../../redux/slice/authSlice';
import { message } from 'antd';
import axios from 'axios';
import OnelabLogo from "../../shared/OnelabLogo";

// Configure Ant Design message
message.config({
  top: 100,
  duration: 5,
  maxCount: 3,
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear any existing authentication state on component mount
  React.useEffect(() => {
    console.log('Login component mounted - clearing auth state');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // Clear Redux auth state
    dispatch({ type: 'auth/clearAuth' });
  }, [dispatch]);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setIsGoogleLoading(true);
      const loadingMessage = message.loading('Authenticating with Google...', 0);
      
      try {
        // Create axios instance with timeout
        const apiClient = axios.create({
          timeout: 15000, // 15 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const response = await apiClient.post(
          `${import.meta.env.VITE_PUBLIC_AUTH_URL}/user/google-login/`,
          { token: tokenResponse.access_token },
          { withCredentials: true }
        );
        
        loadingMessage(); // Hide loading message
        
        // Debug: Log the response to see what we're getting
        console.log('Google login response:', response?.data);
        console.log('Response success value:', response?.data?.success);
        console.log('Response message:', response?.data?.message);
        
        // Check for blocked user response first (when API returns success: false with is_blocked: true)
        if (response?.data?.is_blocked === true) {
          const errorMessage = response?.data?.message || 'Your account has been blocked. Please contact your administrator for assistance.';
          console.log('User is blocked, showing error:', errorMessage);
          message.error(errorMessage, 5); // Show for 5 seconds
          setIsGoogleLoading(false);
          return;
        }
        
        // Check if success is false (this handles the case where API returns success: false)
        // This should catch the response: { success: false, message: "..." }
        if (response?.data && response.data.success === false) {
          const errorMessage = response.data.message || 'Login failed. Please try again.';
          console.log('Login failed (success: false), showing error:', errorMessage);
          message.error(errorMessage, 5); // Show for 5 seconds
          setIsGoogleLoading(false);
          return;
        }
        
        // Also check if response.data exists but doesn't have success or data fields
        if (response?.data && response.data.success !== true && !response.data.data && response.data.message) {
          const errorMessage = response.data.message;
          console.log('Login failed (no success field or success is not true), showing error:', errorMessage);
          message.error(errorMessage, 5); // Show for 5 seconds
          setIsGoogleLoading(false);
          return;
        }
        
        if (response?.data?.success && response?.data?.data) {
          // Check if user is blocked (additional check in case is_blocked is in data.user)
          const user = response.data.data.user;
          if (user && user.is_blocked === true) {
            message.error('Your account has been blocked. Please contact your administrator for assistance.');
            return;
          }
          
          localStorage.setItem('token', response.data.data.access);
          localStorage.setItem('refreshToken', response.data.data.refresh);
          dispatch(setUserFromBackend(response.data));
          message.success('Successfully logged in with Google!');
          navigate('/auth/dashboard');
        } else {
          // Handle other error cases
          const errorMessage = response?.data?.message || 'Invalid response from server';
          message.error(errorMessage);
        }
      } catch (error: any) {
        loadingMessage(); // Hide loading message
        console.error('Google login error:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        // Always set loading to false
        setIsGoogleLoading(false);
        
        // Check for blocked user in error response
        if (error.response?.data?.is_blocked === true || error.message?.includes('blocked')) {
          const errorMsg = error.response?.data?.message || error.message || 'Your account has been blocked. Please contact your administrator for assistance.';
          console.log('Showing blocked user error:', errorMsg);
          setErrorMessage(errorMsg);
          // Use message.destroy() first to clear any existing messages
          message.destroy();
          // Then show the error message with explicit configuration
          setTimeout(() => {
            message.error(errorMsg, 5);
          }, 100);
          return;
        }
        
        // Handle 403 Forbidden - account blocked or access denied
        if (error.response?.status === 403) {
          const errorMsg = error.response?.data?.message || 'Your account has been blocked. Please contact your administrator for assistance.';
          console.log('403 error - showing message:', errorMsg);
          setErrorMessage(errorMsg);
          // Use message.destroy() first to clear any existing messages
          message.destroy();
          // Then show the error message with explicit configuration
          setTimeout(() => {
            message.error(errorMsg, 5);
          }, 100);
          return;
        }
        
        // Handle other specific status codes
        if (error.code === 'ECONNABORTED') {
          message.destroy();
          message.error({
            content: 'Login request timed out. Please try again.',
            duration: 5,
            style: { marginTop: '20vh' }
          });
        } else if (error.response?.status === 500) {
          message.destroy();
          message.error({
            content: 'Server error. Please try again later.',
            duration: 5,
            style: { marginTop: '20vh' }
          });
        } else if (error.response?.status === 401) {
          message.destroy();
          message.error({
            content: 'Invalid Google token. Please try again.',
            duration: 5,
            style: { marginTop: '20vh' }
          });
        } else if (error.response?.data?.message) {
          // Show the error message from the API response
          console.log('Showing API error message:', error.response.data.message);
          message.destroy();
          message.error({
            content: error.response.data.message,
            duration: 5,
            style: { marginTop: '20vh' }
          });
        } else if (error.message) {
          // Show the error message from the error object
          console.log('Showing error message:', error.message);
          message.destroy();
          message.error({
            content: error.message,
            duration: 5,
            style: { marginTop: '20vh' }
          });
        } else {
          // Fallback error message
          console.log('Showing fallback error message');
          message.destroy();
          message.error({
            content: 'Google login failed. Please try again.',
            duration: 5,
            style: { marginTop: '20vh' }
          });
        }
      }
    },
    onError: error => {
      console.error('Google OAuth error:', error);
      message.error('Google authentication failed. Please try again.');
      setIsGoogleLoading(false);
    },
  });


  const features = [
    {
      icon: Users,
      title: "Smart Meeting Tracking",
      description: "Automatically capture and organize all your meeting data"
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Get intelligent summaries and action items instantly"
    },
    {
      icon: Shield,
      title: "Enterprise Security", 
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left Panel - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-center p-12">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <div className="mb-12">
              <div className="flex justify-center mb-16 -ml-10">
                <OnelabLogo size="xl" />
              </div>
              <h1 className="text-4xl font-bold text-[#282F3B] mb-4 leading-tight ">
                Transform Your Meeting Experience
              </h1>
              <p className="text-lg text-[#282F3B] opacity-80 leading-relaxed">
                Streamline collaboration with AI-powered meeting transcription, 
                smart summaries, and actionable insights.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#282F3B] mb-1 text-lg">{feature.title}</h3>
                    <p className="text-sm text-[#282F3B] opacity-70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form with Dark Cyan Background */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden" style={{ backgroundColor: '#078586' }}>
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 left-10 w-16 h-16 bg-white/10 rounded-full blur-md"></div>
            <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 w-full max-w-md">
            <Card className="w-full shadow-2xl border-0 bg-white rounded-2xl">
              <CardHeader className="text-center pb-8 px-8 pt-8">
                <div className="lg:hidden mb-6">
                  <OnelabLogo className="mx-auto" size="lg" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#282F3B] mb-2">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-[#282F3B] opacity-70">
                    Sign in to access your meeting dashboard
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 px-8 pb-8">
                {/* Error Message Display */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                    </div>
                    <button
                      onClick={() => setErrorMessage(null)}
                      className="text-red-600 hover:text-red-800 flex-shrink-0"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                <Button 
                  type="button"
                  onClick={() => {
                    setErrorMessage(null); // Clear any previous error
                    loginWithGoogle();
                  }}
                  size="lg"
                  disabled={isGoogleLoading}
                  className="w-full bg-white border border-gray-200 text-[#282F3B] hover:bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  {isGoogleLoading ? 'Authenticating...' : 'Continue with Google'}
                </Button>
                
                {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-500 font-medium tracking-wide">
                      SECURE ENTERPRISE LOGIN
                    </span>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500">
                    Protected by enterprise-grade security and encryption
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <span>Terms of Service</span>
                    <span>•</span>
                    <span>Privacy Policy</span>
                  </div>
                </div> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
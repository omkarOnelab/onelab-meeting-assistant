import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Shield, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { setUserFromBackend } from '../../../redux/slice/authSlice';
import { message } from 'antd';
import axios from 'axios';
import OnelabLogo from "../../shared/OnelabLogo";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
          navigate('/auth');
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
              <OnelabLogo className="mb-8" />
              <h1 className="text-4xl font-bold text-[#282F3B] mb-4 leading-tight">
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
                  <OnelabLogo className="mx-auto" />
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
                <Button 
                  type="button"
                  onClick={() => loginWithGoogle()}
                  size="lg"
                  className="w-full bg-white border border-gray-200 text-[#282F3B] hover:bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md h-12 rounded-lg"
                >
                  <Chrome className="w-5 h-5 mr-3" />
                  Continue with Google
                </Button>
                
                <div className="relative">
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
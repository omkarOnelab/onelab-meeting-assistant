import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../redux/store';
import type { AppDispatch } from '../redux/store';
import {
  loginUser,
  registerUser,
  googleLogin,
  microsoftLogin,
  logoutUser,
  getCurrentUser,
  refreshUserToken,
  checkAuthStatus
} from '../redux/actions/authActions';
import { clearError, updateUser } from '../redux/slice/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Select auth state from Redux store
  const auth = useSelector((state: RootState) => state.auth);
  
  // Destructure auth state for easy access
  const {
    user,
    token,
    refreshToken: storedRefreshToken,
    isAuthenticated,
    isLoading,
    error
  } = auth;

  // Login function
  const login = async (email: string, password: string) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate('/dashboard');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Google OAuth login function
  const loginWithGoogle = async (googleResponse: any) => {
    try {
      await dispatch(googleLogin(googleResponse)).unwrap();
      navigate('/dashboard');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Microsoft OAuth login function
  const loginWithMicrosoft = async (microsoftResponse: any) => {
    try {
      await dispatch(microsoftLogin(microsoftResponse)).unwrap();
      navigate('/dashboard');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Registration function
  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      await dispatch(registerUser({ name, email, password, confirmPassword })).unwrap();
      navigate('/dashboard');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/non-auth/login');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Get current user function
  const fetchCurrentUser = async () => {
    try {
      await dispatch(getCurrentUser()).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Refresh token function
  const refreshUserTokenFunc = async () => {
    try {
      await dispatch(refreshUserToken()).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Check auth status function
  const checkAuth = async () => {
    try {
      await dispatch(checkAuthStatus()).unwrap();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Clear error function
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Update user profile function
  const updateUserProfile = (updates: any) => {
    dispatch(updateUser(updates));
  };

  return {
    // State
    user,
    token,
    storedRefreshToken,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    loginWithGoogle,
    loginWithMicrosoft,
    register,
    logout,
    fetchCurrentUser,
    refreshUserTokenFunc,
    checkAuth,
    clearAuthError,
    updateUserProfile,
  };
};

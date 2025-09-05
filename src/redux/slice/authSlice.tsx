import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, BackendUser, BackendAuthResponse } from '../../types/auth';
import {
  loginUser,
  registerUser,
  googleLogin,
  microsoftLogin,
  logoutUser,
  getCurrentUser,
  refreshUserToken,
  checkAuthStatus
} from '../actions/authActions';

const initialState: AuthState = {
  user: null,
  workspace: null,
  membership: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Update user profile
    updateUser: (state, action: PayloadAction<Partial<BackendUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Clear auth state (for logout)
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    // Set user from backend response (for direct integration)
    setUserFromBackend: (state, action: PayloadAction<BackendAuthResponse>) => {
      const { data } = action.payload;
      state.user = data.user;
      state.workspace = data.workspace;
      state.membership = data.membership;
      state.token = data.access;
      state.refreshToken = data.refresh;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
  },
extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<BackendAuthResponse>) => {
        state.isLoading = false;
        const { data } = action.payload;
        state.user = data.user;
        state.workspace = data.workspace;
        state.membership = data.membership;
        state.token = data.access;
        state.refreshToken = data.refresh;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Login failed';
        state.isAuthenticated = false;
      })

    // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<BackendAuthResponse>) => {
        state.isLoading = false;
        const { data } = action.payload;
        state.user = data.user;
        state.workspace = data.workspace;
        state.membership = data.membership;
        state.token = data.access;
        state.refreshToken = data.refresh;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Registration failed';
        state.isAuthenticated = false;
      })

    // Google login cases
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action: PayloadAction<BackendAuthResponse>) => {
        state.isLoading = false;
        const { data } = action.payload;
        state.user = data.user;
        state.workspace = data.workspace;
        state.membership = data.membership;
        state.token = data.access;
        state.refreshToken = data.refresh;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Google login failed';
        state.isAuthenticated = false;
      })

    // Microsoft login cases
      .addCase(microsoftLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(microsoftLogin.fulfilled, (state, action: PayloadAction<BackendAuthResponse>) => {
        state.isLoading = false;
        const { data } = action.payload;
        state.user = data.user;
        state.workspace = data.workspace;
        state.membership = data.membership;
        state.token = data.access;
        state.refreshToken = data.refresh;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(microsoftLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Microsoft login failed';
        state.isAuthenticated = false;
      })

    // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Logout failed';
      })

    // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<BackendAuthResponse>) => {
        state.isLoading = false;
        const { data } = action.payload;
        state.user = data.user;
        state.workspace = data.workspace;
        state.membership = data.membership;
        state.token = data.access;
        state.refreshToken = data.refresh;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to get user profile';
        state.isAuthenticated = false;
      })

    // Refresh token cases
      .addCase(refreshUserToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshUserToken.fulfilled, (state, action: PayloadAction<{ token: string }>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Token refresh failed';
        state.isAuthenticated = false;
      })

    // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<boolean>) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload;
        if (!action.payload) {
          state.user = null;
          state.token = null;
          state.refreshToken = null;
        }
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to check auth status';
        state.isAuthenticated = false;
      });
},
});

export const { clearError, setLoading, updateUser, clearAuth, setUserFromBackend } = authSlice.actions;
export default authSlice.reducer;
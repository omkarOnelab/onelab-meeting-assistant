// Backend response types (actual API structure)
export interface BackendUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  sign_up_type: 'google' | 'microsoft' | 'email';
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  created_by: BackendUser;
  created_at: string;
  member_count: number;
}

export interface Membership {
  id: number;
  user: BackendUser;
  workspace: Workspace;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  invited_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    workspace: Workspace;
    membership: Membership;
    access: string;
    refresh: string;
  };
}

// Frontend types (for internal use)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  user: BackendUser | null; // Using BackendUser for actual data
  workspace: Workspace | null;
  membership: Membership | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface GoogleAuthResponse {
  credential: string;
  clientId: string;
}

export interface MicrosoftAuthResponse {
  accessToken: string;
  idToken: string;
}

// Google OAuth token response
export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

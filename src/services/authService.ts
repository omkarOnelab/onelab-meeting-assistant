import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  GoogleAuthResponse,
  MicrosoftAuthResponse 
} from '../types/auth';

// Mock API service for now - replace with actual axios implementation
export const authService = {
  // Traditional email/password login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          resolve({
            user: {
              id: '1',
              email: credentials.email,
              name: 'Mock User',
              role: 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },

  // User registration
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.password === credentials.confirmPassword) {
          resolve({
            user: {
              id: '1',
              email: credentials.email,
              name: credentials.name,
              role: 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
          });
        } else {
          reject(new Error('Passwords do not match'));
        }
      }, 1000);
    });
  },

  // Google OAuth login
  async googleLogin(_googleResponse: GoogleAuthResponse): Promise<AuthResponse> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: '1',
            email: 'user@gmail.com',
            name: 'Google User',
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        });
      }, 1000);
    });
  },

  // Microsoft OAuth login
  async microsoftLogin(_microsoftResponse: MicrosoftAuthResponse): Promise<AuthResponse> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: '1',
            email: 'user@microsoft.com',
            name: 'Microsoft User',
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        });
      }, 1000);
    });
  },

  // Logout
  async logout(): Promise<void> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        resolve();
      }, 500);
    });
  },

  // Get current user profile
  async getCurrentUser(): Promise<AuthResponse> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: '1',
            email: 'user@example.com',
            name: 'Current User',
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token',
        });
      }, 500);
    });
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ token: 'new-mock-jwt-token' });
      }, 500);
    });
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
};

export default authService;

// Token Provider Utility
// This utility helps services get the auth token without creating circular dependencies
// Services should use this instead of directly importing the store

let storeInstance: any = null;

// Initialize the store reference (called from main.tsx after store is created)
export const setStoreInstance = (store: any) => {
  storeInstance = store;
};

// Get the current auth token from Redux store or localStorage
export const getAuthToken = (): string | null => {
  try {
    // Try to get token from Redux store first
    if (storeInstance) {
      const reduxToken = storeInstance.getState()?.auth?.token;
      if (reduxToken) {
        return reduxToken;
      }
    }
  } catch (error) {
    console.warn('tokenProvider: Error accessing Redux store:', error);
  }
  
  // Fallback to localStorage
  const localStorageToken = localStorage.getItem('token');
  return localStorageToken;
};

// Get the current refresh token from Redux store or localStorage
export const getRefreshToken = (): string | null => {
  try {
    // Try to get refresh token from Redux store first
    if (storeInstance) {
      const reduxRefreshToken = storeInstance.getState()?.auth?.refreshToken;
      if (reduxRefreshToken) {
        return reduxRefreshToken;
      }
    }
  } catch (error) {
    console.warn('tokenProvider: Error accessing Redux store:', error);
  }
  
  // Fallback to localStorage
  const localStorageRefreshToken = localStorage.getItem('refreshToken');
  return localStorageRefreshToken;
};


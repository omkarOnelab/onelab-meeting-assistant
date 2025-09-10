import axios, { AxiosError } from 'axios';

// Create a configured axios instance for API calls
export const createApiClient = (baseURL: string, timeout: number = 15000) => {
  return axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Enhanced error handling for API calls
export const handleApiError = (error: AxiosError): string => {
  console.error('API Error:', error);

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  if (error.response) {
    const status = error.response.status;
    const data = error.response.data as any;

    switch (status) {
      case 400:
        return data?.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please try again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return data?.message || `Request failed with status ${status}`;
    }
  }

  if (error.request) {
    return 'Network error. Please check your connection and try again.';
  }

  return 'An unexpected error occurred. Please try again.';
};

// Retry logic for failed requests
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

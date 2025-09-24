// Error handling utilities for consistent error management

export const getErrorMessage = (error) => {
  // Handle different types of errors
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return 'Network error. Please check your internet connection.';
  }

  // Handle timeout errors
  if (error?.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }

  // Handle specific HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized access. Please log in again.';
      case 403:
        return 'Access forbidden. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The resource already exists or is in use.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Request failed with status ${error.status}.`;
    }
  }

  return 'An unexpected error occurred. Please try again.';
};

export const handleApiError = (error, context = '') => {
  const message = getErrorMessage(error);
  const errorInfo = {
    message,
    context,
    timestamp: new Date().toISOString(),
    error: error
  };

  // Log error for debugging
  console.error(`API Error${context ? ` (${context})` : ''}:`, errorInfo);

  return errorInfo;
};

export const isNetworkError = (error) => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error') ||
    !navigator.onLine
  );
};

export const isTimeoutError = (error) => {
  return (
    error?.code === 'ECONNABORTED' ||
    error?.message?.includes('timeout')
  );
};

export const shouldRetry = (error, retryCount = 0, maxRetries = 3) => {
  if (retryCount >= maxRetries) {
    return false;
  }

  // Retry on network errors
  if (isNetworkError(error)) {
    return true;
  }

  // Retry on timeout errors
  if (isTimeoutError(error)) {
    return true;
  }

  // Retry on server errors (5xx)
  if (error?.status >= 500) {
    return true;
  }

  // Don't retry on client errors (4xx)
  return false;
};

export const getRetryDelay = (retryCount) => {
  // Exponential backoff: 1s, 2s, 4s, 8s...
  return Math.min(1000 * Math.pow(2, retryCount), 10000);
};
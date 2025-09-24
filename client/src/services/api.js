import axios from 'axios';
import { handleApiError, shouldRetry, getRetryDelay } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle and format error
    const errorInfo = handleApiError(error, originalRequest?.url);
    
    // Implement retry logic for certain errors
    if (!originalRequest._retry && shouldRetry(error, originalRequest._retryCount || 0)) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      const delay = getRetryDelay(originalRequest._retryCount);
      console.log(`Retrying request to ${originalRequest.url} in ${delay}ms (attempt ${originalRequest._retryCount})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
    }
    
    // Format error for consistent handling
    const formattedError = {
      message: errorInfo.message,
      status: error.response?.status,
      code: error.response?.data?.error?.code || error.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.error?.details || {},
      originalError: error
    };
    
    return Promise.reject(formattedError);
  }
);

// Wrapper function for API calls with consistent error handling
const apiCall = async (requestFn, context = '') => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    const errorInfo = handleApiError(error, context);
    throw errorInfo;
  }
};

// Booking API functions
export const bookingAPI = {
  // Get all bookings with pagination and filters
  getBookings: async (params = {}) => {
    return apiCall(
      () => api.get('/bookings', { params: apiUtils.formatParams(params) }),
      'getBookings'
    ).then(data => ({
      bookings: data.data || data.bookings || [],
      pagination: data.pagination,
      totalPages: data.totalPages,
      totalItems: data.totalItems,
      success: data.success !== false
    }));
  },

  // Get single booking by ID
  getBookingById: async (id) => {
    return apiCall(
      () => api.get(`/bookings/${id}`),
      `getBookingById(${id})`
    );
  },

  // Create new booking
  createBooking: async (bookingData) => {
    return apiCall(
      () => api.post('/bookings', bookingData),
      'createBooking'
    );
  },

  // Update existing booking
  updateBooking: async (id, bookingData) => {
    return apiCall(
      () => api.put(`/bookings/${id}`, bookingData),
      `updateBooking(${id})`
    );
  },

  // Delete booking
  deleteBooking: async (id) => {
    return apiCall(
      () => api.delete(`/bookings/${id}`),
      `deleteBooking(${id})`
    );
  },

  // Search bookings
  searchBookings: async (params = {}) => {
    const searchParams = { ...params };
    if (params.search) {
      searchParams.q = params.search;
      delete searchParams.search;
    }
    
    return apiCall(
      () => api.get('/bookings/search', { params: apiUtils.formatParams(searchParams) }),
      'searchBookings'
    ).then(data => ({
      bookings: data.data || data.bookings || [],
      pagination: data.pagination,
      totalPages: data.totalPages,
      totalItems: data.totalItems,
      success: data.success !== false,
      searchTerm: data.searchTerm || params.search
    }));
  },

  // Update booking rating
  updateBookingRating: async (id, rating) => {
    return apiCall(
      () => api.patch(`/bookings/${id}/rating`, { rating }),
      `updateBookingRating(${id})`
    );
  },

  // Get booking statistics (if needed for dashboard)
  getBookingStats: async () => {
    return apiCall(
      () => api.get('/bookings/stats'),
      'getBookingStats'
    );
  },
};

// Utility functions for API calls
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.status === 404) {
      return 'Resource not found';
    } else if (error.status === 400) {
      return error.message || 'Invalid request data';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else if (!navigator.onLine) {
      return 'No internet connection. Please check your network.';
    }
    return error.message || 'An unexpected error occurred';
  },

  // Format query parameters for API calls
  formatParams: (params) => {
    const formatted = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        formatted[key] = params[key];
      }
    });
    return formatted;
  },

  // Check if response is successful
  isSuccessResponse: (response) => {
    return response && response.success !== false;
  }
};

export default api;
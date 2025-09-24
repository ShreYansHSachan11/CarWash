// User-friendly error messages for common scenarios
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    action: 'Retry'
  },
  TIMEOUT_ERROR: {
    title: 'Request Timeout',
    message: 'The request is taking longer than expected. Please try again.',
    action: 'Retry'
  },
  OFFLINE: {
    title: 'You\'re Offline',
    message: 'Please check your internet connection and try again.',
    action: 'Retry when online'
  },

  // Booking-specific errors
  BOOKING_NOT_FOUND: {
    title: 'Booking Not Found',
    message: 'The booking you\'re looking for doesn\'t exist or may have been deleted.',
    action: 'Go to bookings'
  },
  BOOKING_CREATION_FAILED: {
    title: 'Failed to Create Booking',
    message: 'We couldn\'t create your booking. Please check your information and try again.',
    action: 'Try again'
  },
  BOOKING_UPDATE_FAILED: {
    title: 'Failed to Update Booking',
    message: 'We couldn\'t save your changes. Please try again.',
    action: 'Try again'
  },
  BOOKING_DELETE_FAILED: {
    title: 'Failed to Delete Booking',
    message: 'We couldn\'t delete the booking. Please try again.',
    action: 'Try again'
  },

  // Validation errors
  VALIDATION_ERROR: {
    title: 'Invalid Information',
    message: 'Please check the highlighted fields and correct any errors.',
    action: 'Fix errors'
  },
  REQUIRED_FIELDS: {
    title: 'Missing Information',
    message: 'Please fill in all required fields before continuing.',
    action: 'Complete form'
  },

  // Server errors
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again in a few moments.',
    action: 'Try again'
  },
  SERVICE_UNAVAILABLE: {
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable. Please try again later.',
    action: 'Try later'
  },

  // Search and filter errors
  SEARCH_FAILED: {
    title: 'Search Failed',
    message: 'We couldn\'t complete your search. Please try again.',
    action: 'Try again'
  },
  NO_RESULTS: {
    title: 'No Results Found',
    message: 'No bookings match your search criteria. Try adjusting your filters.',
    action: 'Clear filters'
  },

  // Permission errors
  UNAUTHORIZED: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    action: 'Go back'
  },
  FORBIDDEN: {
    title: 'Forbidden',
    message: 'This action is not allowed.',
    action: 'Go back'
  },

  // Rate limiting
  RATE_LIMITED: {
    title: 'Too Many Requests',
    message: 'You\'re making requests too quickly. Please wait a moment and try again.',
    action: 'Wait and retry'
  },

  // Generic fallback
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Try again'
  }
};

// Function to get user-friendly error message based on error type
export const getUserFriendlyError = (error) => {
  // Handle string errors
  if (typeof error === 'string') {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Handle network errors
  if (!navigator.onLine) {
    return ERROR_MESSAGES.OFFLINE;
  }

  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  // Handle HTTP status codes
  if (error?.status) {
    switch (error.status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        // Check if it's a booking-specific 404
        if (error?.originalError?.config?.url?.includes('/bookings/')) {
          return ERROR_MESSAGES.BOOKING_NOT_FOUND;
        }
        return {
          title: 'Not Found',
          message: 'The requested resource was not found.',
          action: 'Go back'
        };
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 429:
        return ERROR_MESSAGES.RATE_LIMITED;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // Handle specific error messages
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('booking') && message.includes('not found')) {
      return ERROR_MESSAGES.BOOKING_NOT_FOUND;
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ERROR_MESSAGES.VALIDATION_ERROR;
    }
    
    if (message.includes('required')) {
      return ERROR_MESSAGES.REQUIRED_FIELDS;
    }
    
    if (message.includes('search')) {
      return ERROR_MESSAGES.SEARCH_FAILED;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Function to get contextual error message based on the operation
export const getContextualError = (error, context) => {
  const baseError = getUserFriendlyError(error);
  
  switch (context) {
    case 'createBooking':
      return {
        ...ERROR_MESSAGES.BOOKING_CREATION_FAILED,
        details: baseError.message
      };
    case 'updateBooking':
      return {
        ...ERROR_MESSAGES.BOOKING_UPDATE_FAILED,
        details: baseError.message
      };
    case 'deleteBooking':
      return {
        ...ERROR_MESSAGES.BOOKING_DELETE_FAILED,
        details: baseError.message
      };
    case 'searchBookings':
      return {
        ...ERROR_MESSAGES.SEARCH_FAILED,
        details: baseError.message
      };
    default:
      return baseError;
  }
};

// Error message component props generator
export const getErrorProps = (error, context = null) => {
  const errorInfo = context ? getContextualError(error, context) : getUserFriendlyError(error);
  
  return {
    title: errorInfo.title,
    message: errorInfo.message,
    variant: 'error',
    showRetry: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'].some(
      type => ERROR_MESSAGES[type].title === errorInfo.title
    )
  };
};
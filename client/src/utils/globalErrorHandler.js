import { getErrorMessage } from './errorHandler';

// Global error handler for unhandled errors
class GlobalErrorHandler {
  constructor() {
    this.errorListeners = [];
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, 'unhandledrejection');
      event.preventDefault(); // Prevent default browser error handling
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global JavaScript error:', event.error);
      this.handleError(event.error, 'javascript');
    });

    // Handle network errors
    window.addEventListener('offline', () => {
      this.handleError(new Error('Network connection lost'), 'network');
    });

    window.addEventListener('online', () => {
      this.notifyListeners({
        type: 'network',
        message: 'Network connection restored',
        severity: 'info'
      });
    });
  }

  handleError(error, context = 'unknown') {
    const errorInfo = {
      message: getErrorMessage(error),
      context,
      timestamp: new Date().toISOString(),
      error,
      severity: this.getErrorSeverity(error, context)
    };

    // Log error
    console.error(`Global error (${context}):`, errorInfo);

    // Notify listeners
    this.notifyListeners(errorInfo);

    // Report to external service if available
    this.reportError(errorInfo);
  }

  getErrorSeverity(error, context) {
    if (context === 'network') return 'warning';
    if (error?.status >= 500) return 'error';
    if (error?.status >= 400) return 'warning';
    if (context === 'unhandledrejection') return 'error';
    return 'error';
  }

  reportError(errorInfo) {
    // Report to external error tracking service
    if (window.errorReporting) {
      window.errorReporting.captureException(errorInfo.error, {
        extra: {
          context: errorInfo.context,
          message: errorInfo.message,
          timestamp: errorInfo.timestamp
        },
        tags: {
          severity: errorInfo.severity
        }
      });
    }

    // Store in local storage for debugging (keep last 10 errors)
    try {
      const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      storedErrors.unshift({
        ...errorInfo,
        error: errorInfo.error?.toString() || 'Unknown error'
      });
      localStorage.setItem('app_errors', JSON.stringify(storedErrors.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to store error in localStorage:', e);
    }
  }

  addErrorListener(listener) {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  notifyListeners(errorInfo) {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (e) {
        console.error('Error in error listener:', e);
      }
    });
  }

  // Method to manually report errors
  captureError(error, context = 'manual') {
    this.handleError(error, context);
  }

  // Get stored errors for debugging
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Clear stored errors
  clearStoredErrors() {
    localStorage.removeItem('app_errors');
  }
}

// Create singleton instance
const globalErrorHandler = new GlobalErrorHandler();

// Hook for using global error handler in React components
import React from 'react';

export const useGlobalErrorHandler = () => {
  const [errors, setErrors] = React.useState([]);

  React.useEffect(() => {
    const removeListener = globalErrorHandler.addErrorListener((errorInfo) => {
      setErrors(prev => [errorInfo, ...prev.slice(0, 4)]); // Keep last 5 errors
    });

    return removeListener;
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const captureError = React.useCallback((error, context) => {
    globalErrorHandler.captureError(error, context);
  }, []);

  return {
    errors,
    clearErrors,
    captureError,
    hasErrors: errors.length > 0
  };
};

export default globalErrorHandler;
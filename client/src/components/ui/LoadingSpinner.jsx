import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  text = ''
}) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const colors = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    red: 'text-red-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };
  
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <svg 
        className={`animate-spin ${sizes[size]} ${colors[color]}`} 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className={`text-sm ${colors[color]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Full page loading spinner
export const PageLoader = ({ text = 'Loading...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${className}`}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

// Inline loading spinner for buttons and small areas
export const InlineLoader = ({ className = '', size = 'sm', color = 'white' }) => {
  return (
    <LoadingSpinner 
      size={size}
      color={color}
      className={`inline-block ${className}`}
    />
  );
};

// Button loading state
export const ButtonLoader = ({ text = 'Loading...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <LoadingSpinner size="sm" color="white" />
      <span>{text}</span>
    </div>
  );
};

// Loading overlay for forms and content areas
export const LoadingOverlay = ({ 
  isLoading, 
  text = 'Loading...', 
  children,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
};

// Loading state for search operations
export const SearchLoader = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <LoadingSpinner size="md" text="Searching..." />
    </div>
  );
};

// Loading state for filter operations
export const FilterLoader = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`}>
      <LoadingSpinner size="sm" text="Applying filters..." />
    </div>
  );
};

// Loading state for data operations
export const DataLoader = ({ 
  operation = 'Loading', 
  size = 'md', 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <LoadingSpinner size={size} text={`${operation}...`} />
    </div>
  );
};

// Minimal loading indicator for subtle operations
export const MinimalLoader = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

// Progress bar loader
export const ProgressLoader = ({ 
  progress = 0, 
  text = '', 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {text && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{text}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
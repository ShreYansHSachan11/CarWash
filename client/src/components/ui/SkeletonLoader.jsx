import React from 'react';

// Base skeleton component
const Skeleton = ({ className = '', width, height, rounded = false }) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  const roundedClass = rounded ? 'rounded-full' : 'rounded';
  const sizeClasses = width && height ? '' : 'h-4 w-full';
  
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div 
      className={`${baseClasses} ${roundedClass} ${sizeClasses} ${className}`}
      style={style}
    />
  );
};

// Skeleton for booking cards
export const BookingCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      {/* Header with status */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton width="120px" height="20px" />
          <Skeleton width="80px" height="16px" />
        </div>
        <Skeleton width="80px" height="24px" rounded />
      </div>
      
      {/* Customer and car info */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton width="20px" height="20px" />
          <Skeleton width="150px" height="16px" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton width="20px" height="20px" />
          <Skeleton width="200px" height="16px" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton width="20px" height="20px" />
          <Skeleton width="100px" height="16px" />
        </div>
      </div>
      
      {/* Date and time */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="space-y-1">
          <Skeleton width="80px" height="14px" />
          <Skeleton width="120px" height="16px" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton width="60px" height="14px" />
          <Skeleton width="80px" height="20px" />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton width="60px" height="32px" />
        <Skeleton width="60px" height="32px" />
        <Skeleton width="60px" height="32px" />
      </div>
    </div>
  );
};

// Skeleton for booking list
export const BookingListSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <BookingCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Skeleton for booking detail page
export const BookingDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Skeleton width="120px" height="20px" />
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="space-y-2">
          <Skeleton width="200px" height="32px" />
          <Skeleton width="150px" height="16px" />
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Skeleton width="80px" height="40px" />
          <Skeleton width="80px" height="40px" />
          <Skeleton width="100px" height="40px" />
        </div>
      </div>
      
      {/* Status badge */}
      <div className="mb-6">
        <Skeleton width="100px" height="28px" rounded />
      </div>
      
      {/* Main content card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <Skeleton width="150px" height="24px" />
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Skeleton width="20px" height="20px" />
                  <div className="space-y-2 flex-1">
                    <Skeleton width="100px" height="14px" />
                    <Skeleton width="180px" height="16px" />
                    <Skeleton width="120px" height="14px" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Skeleton width="20px" height="20px" />
                  <div className="space-y-2 flex-1">
                    <Skeleton width="80px" height="14px" />
                    <Skeleton width="150px" height="16px" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Add-ons section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Skeleton width="120px" height="16px" className="mb-3" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} width="100px" height="28px" rounded />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for form fields
export const FormFieldSkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton width="100px" height="16px" />
      <Skeleton width="100%" height="40px" />
    </div>
  );
};

// Skeleton for search and filter sidebar
export const FilterSidebarSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Skeleton width="60px" height="16px" />
        <Skeleton width="100%" height="40px" />
      </div>
      
      {/* Filter sections */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton width="120px" height="18px" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <Skeleton width="16px" height="16px" />
                <Skeleton width="100px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton for pagination
export const PaginationSkeleton = () => {
  return (
    <div className="flex items-center justify-between">
      <Skeleton width="150px" height="16px" />
      <div className="flex space-x-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} width="40px" height="40px" />
        ))}
      </div>
      <Skeleton width="100px" height="16px" />
    </div>
  );
};

// Skeleton for table rows
export const TableRowSkeleton = ({ columns = 4 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton width="100%" height="16px" />
        </td>
      ))}
    </tr>
  );
};

export default Skeleton;
import React from 'react';
import { Button, StarRating } from '../ui';

const BookingCard = ({ booking, onView, onEdit, onDelete, onClick, className = "" }) => {
  const getStatusBadgeColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getServiceTypeColor = (serviceType) => {
    const colors = {
      'Basic Wash': 'bg-gray-50 text-gray-700 border-gray-200',
      'Deluxe Wash': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Full Detailing': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return colors[serviceType] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on action buttons
    if (e.target.closest('button')) return;
    if (onClick) onClick(booking);
  };

  return (
    <article 
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 min-w-[280px] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleCardClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(booking);
        }
      } : undefined}
      aria-label={`Booking for ${booking.customerName} - ${booking.carDetails.year} ${booking.carDetails.make} ${booking.carDetails.model} - ${booking.status}`}
    >
      {/* Header with Status and Service Type */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(booking.status)}`}>
            {booking.status}
          </span>
          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getServiceTypeColor(booking.serviceType)}`}>
            <span className="hidden sm:inline">{booking.serviceType}</span>
            <span className="sm:hidden">{booking.serviceType.split(' ')[0]}</span>
          </span>
        </div>
        <div className="text-right sm:text-left">
          <div className="text-base sm:text-lg font-bold text-gray-900">${formatPrice(booking.price)}</div>
          <div className="text-xs sm:text-sm text-gray-500">{booking.duration} min</div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{booking.customerName}</h3>
        <div className="text-xs sm:text-sm text-gray-600">
          <div className="flex flex-col gap-0.5">
            <span className="truncate">{booking.carDetails.year} {booking.carDetails.make} {booking.carDetails.model}</span>
            <span className="capitalize text-gray-500">{booking.carDetails.type}</span>
          </div>
        </div>
      </div>

      {/* Date and Time */}
      <div className="mb-3 sm:mb-4">
        <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{formatDate(booking.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{booking.timeSlot}</span>
          </div>
        </div>
      </div>

      {/* Add-ons */}
      {booking.addOns && booking.addOns.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Add-ons:</div>
          <div className="flex flex-wrap gap-1">
            {booking.addOns.map((addon, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                {addon}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rating for completed bookings */}
      {booking.status === 'Completed' && booking.rating && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Rating:</span>
            <StarRating 
              rating={booking.rating} 
              readOnly={true}
              size={16}
              className="flex-shrink-0"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-1.5 pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(booking._id)}
            className="flex-1 text-xs py-1.5 px-2 min-w-0"
          >
            <span className="truncate">View</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(booking._id)}
            className="flex-1 text-xs py-1.5 px-2 min-w-0"
          >
            <span className="truncate">Edit</span>
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(booking._id)}
          className="w-full text-red-600 hover:text-red-700 hover:border-red-300 text-xs py-1.5 px-2"
        >
          Delete
        </Button>
      </div>
    </article>
  );
};

export default BookingCard;
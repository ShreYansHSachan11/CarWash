import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, Car, User, DollarSign, Star, MapPin } from 'lucide-react';
import { LoadingSpinner, ErrorMessage, Modal, StarRating, BookingDetailSkeleton } from '../components/ui';
import { InvoiceButton } from '../components/invoice';
import { ShareButton } from '../components/sharing';
import { bookingAPI } from '../services/api';
import BookingNotFoundPage from './BookingNotFoundPage';
import { getErrorProps } from '../utils/errorMessages';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getBookingById(id);
      setBooking(response.data || response.booking || response);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await bookingAPI.deleteBooking(id);
      navigate('/', { 
        state: { message: 'Booking deleted successfully' }
      });
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Failed to delete booking. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleRatingSubmit = async (rating) => {
    try {
      setSubmittingRating(true);
      await bookingAPI.updateBookingRating(id, rating);
      setBooking(prev => ({ ...prev, rating }));
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return <BookingDetailSkeleton />;
  }

  if (error) {
    // Show specialized 404 page for booking not found
    if (error.status === 404 || error.message?.includes('not found')) {
      return <BookingNotFoundPage bookingId={id} />;
    }

    // Show general error for other errors
    const errorProps = getErrorProps(error, 'getBookingById');
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bookings
          </Link>
        </div>
        <ErrorMessage 
          {...errorProps}
          onRetry={errorProps.showRetry ? fetchBooking : null}
        />
      </div>
    );
  }

  if (!booking || !booking.carDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bookings
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600">The booking you're looking for doesn't exist or has invalid data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Bookings
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 break-all">Booking ID: {booking._id}</p>
        </div>
        
        {/* Action buttons - responsive layout */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Primary actions */}
          <div className="flex gap-2">
            <Link
              to={`/booking/${id}/edit`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
          
          {/* Secondary actions */}
          <div className="flex gap-2">
            <InvoiceButton 
              booking={booking} 
              variant="download"
              className="flex-1 sm:flex-none bg-green-600 text-white hover:bg-green-700 text-sm px-3 py-2"
            />
            <InvoiceButton 
              booking={booking} 
              variant="print"
              className="flex-1 sm:flex-none bg-purple-600 text-white hover:bg-purple-700 text-sm px-3 py-2"
            />
            <ShareButton 
              booking={booking}
              className="flex-1 sm:flex-none bg-orange-600 text-white hover:bg-orange-700 text-sm px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Booking Information</h2>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Customer Name</p>
                  <p className="text-gray-900 font-medium break-words">{booking.customerName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Car className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Vehicle</p>
                  <p className="text-gray-900 break-words">
                    {booking.carDetails?.year} {booking.carDetails?.make} {booking.carDetails?.model}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{booking.carDetails?.type}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Service Type</p>
                  <p className="text-gray-900">{booking.serviceType}</p>
                  <p className="text-sm text-gray-600">{booking.duration} minutes</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-gray-900 break-words">{formatDate(booking.date)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Time Slot</p>
                  <p className="text-gray-900">{booking.timeSlot}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Price</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatPrice(booking.price)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons */}
          {booking.addOns && booking.addOns.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Add-on Services</h3>
              <div className="flex flex-wrap gap-2">
                {booking.addOns.map((addon, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                    {addon}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rating for completed bookings */}
          {booking.status === 'Completed' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Service Rating</h3>
              {booking.rating ? (
                <div className="space-y-3">
                  <StarRating 
                    rating={booking.rating} 
                    readOnly={true}
                    size={20}
                  />
                  <p className="text-sm text-gray-600">Thank you for rating this service!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-2">How would you rate this service?</p>
                  <StarRating 
                    rating={0}
                    onRatingChange={handleRatingSubmit}
                    readOnly={submittingRating}
                    size={24}
                  />
                  {submittingRating && (
                    <p className="text-sm text-blue-600">Submitting rating...</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {new Date(booking.createdAt).toLocaleString()}
              </div>
              {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(booking.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Booking"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this booking for <strong>{booking.customerName}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Booking'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetailPage;
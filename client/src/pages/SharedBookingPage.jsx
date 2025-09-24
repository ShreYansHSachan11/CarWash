import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Calendar, Clock, Car, User, DollarSign, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { LoadingSpinner, ErrorMessage } from '../components/ui';
import { bookingAPI } from '../services/api';

const SharedBookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedBooking();
  }, [id, token]);

  const fetchSharedBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll use the regular booking API
      // In a real implementation, you'd have a separate endpoint for shared bookings
      const response = await bookingAPI.getBookingById(id);
      setBooking(response.booking || response);
    } catch (err) {
      console.error('Error fetching shared booking:', err);
      if (err.response?.status === 404) {
        setError('Booking not found or link has expired');
      } else {
        setError('Failed to load booking details. Please check the link and try again.');
      }
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'Confirmed':
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
      case 'In Progress':
        return <Clock className="h-6 w-6 text-purple-500" />;
      case 'Pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Booking Data</h1>
            <p className="text-gray-600 mb-6">The booking information could not be loaded.</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">CarWash Pro</h1>
            <p className="mt-2 text-gray-600">Booking Confirmation</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            {getStatusIcon(booking.status)}
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium border ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Booking Confirmation
          </h2>
          <p className="text-gray-600 mt-1">Booking ID: {booking._id}</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer Name</p>
                    <p className="text-gray-900 font-medium">{booking.customerName}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle</p>
                    <p className="text-gray-900">
                      {booking.carDetails.year} {booking.carDetails.make} {booking.carDetails.model}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{booking.carDetails.type}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service Type</p>
                    <p className="text-gray-900">{booking.serviceType}</p>
                    <p className="text-sm text-gray-600">{booking.duration} minutes</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-gray-900">{formatDate(booking.date)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Time Slot</p>
                    <p className="text-gray-900">{booking.timeSlot}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Price</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(booking.price)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            {booking.addOns && booking.addOns.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Add-on Services</h4>
                <div className="flex flex-wrap gap-2">
                  {booking.addOns.map((addon, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                      {addon}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about this booking, please contact us:
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Phone:</strong> (555) 123-4567</p>
            <p><strong>Email:</strong> info@carwashpro.com</p>
            <p><strong>Address:</strong> 123 Main Street, City, State 12345</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Another Service
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedBookingPage;
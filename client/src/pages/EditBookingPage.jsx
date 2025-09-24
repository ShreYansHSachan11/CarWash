import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BookingForm from '../components/booking/BookingForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { bookingAPI } from '../services/api';

const EditBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getBookingById(id);
      
      // Format the booking data for the form
      const bookingData = {
        ...response.data,
        date: response.data.date ? new Date(response.data.date).toISOString().split('T')[0] : ''
      };
      
      setBooking(bookingData);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(
        err.response?.data?.error?.message || 
        'Failed to load booking details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    
    try {
      await bookingAPI.updateBooking(id, formData);
      
      // Navigate back to booking detail page on success
      navigate(`/booking/${id}`, {
        state: { message: 'Booking updated successfully!' }
      });
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(
        err.response?.data?.error?.message || 
        'Failed to update booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !booking) {
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
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to={`/booking/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Booking Details
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
        <p className="mt-2 text-gray-600">
          Update booking details for {booking?.customerName || `ID: ${id}`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Booking Form */}
      {booking && (
        <BookingForm
          initialData={booking}
          onSubmit={handleSubmit}
          loading={submitting}
          submitButtonText="Update Booking"
          showStatusField={true}
        />
      )}
    </div>
  );
};

export default EditBookingPage;
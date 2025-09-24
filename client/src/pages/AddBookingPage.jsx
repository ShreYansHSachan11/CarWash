import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BookingForm from '../components/booking/BookingForm';
import { bookingAPI } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';

const AddBookingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await bookingAPI.createBooking(formData);
      
      // Navigate to the booking detail page on success
      navigate(`/booking/${response.data._id}`, {
        state: { message: 'Booking created successfully!' }
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(
        err.response?.data?.error?.message || 
        'Failed to create booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Booking</h1>
        <p className="mt-2 text-gray-600">Fill in the details to schedule a car wash service</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Booking Form */}
      <BookingForm
        onSubmit={handleSubmit}
        loading={loading}
        submitButtonText="Create Booking"
      />
    </div>
  );
};

export default AddBookingPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingCard from './BookingCard';
import { Pagination, LoadingSpinner, ErrorMessage, BookingListSkeleton } from '../ui';
import { bookingAPI } from '../../services/api';
import { getErrorProps } from '../../utils/errorMessages';

const BookingList = ({ 
  searchTerm = '', 
  filters = {}, 
  sortBy = 'createdAt', 
  sortOrder = 'desc',
  itemsPerPage = 8 
}) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        ...filters,
      };

      // Add search term if provided
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await bookingAPI.getBookings(params);
      
      setBookings(response.bookings || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch bookings when dependencies change
  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchTerm, filters, sortBy, sortOrder, itemsPerPage]);

  // Reset to first page when search or filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, filters, sortBy, sortOrder]);

  // Handle booking actions
  const handleViewBooking = (bookingId) => {
    navigate(`/booking/${bookingId}`);
  };

  const handleEditBooking = (bookingId) => {
    navigate(`/booking/${bookingId}/edit`);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingAPI.deleteBooking(bookingId);
        // Refresh the list after deletion
        fetchBookings();
      } catch (err) {
        console.error('Error deleting booking:', err);
        alert('Failed to delete booking. Please try again.');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Results summary skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Skeleton loading for booking cards */}
        <BookingListSkeleton count={itemsPerPage} />
        
        {/* Pagination skeleton */}
        <div className="flex justify-center pt-6">
          <div className="flex space-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorProps = getErrorProps(error, 'getBookings');
    return (
      <div className="py-12">
        <ErrorMessage 
          {...errorProps}
          onRetry={errorProps.showRetry ? fetchBookings : null}
        />
      </div>
    );
  }

  // Empty state
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || Object.keys(filters).length > 0 ? 'No bookings found' : 'No bookings yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || Object.keys(filters).length > 0 
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Get started by creating your first booking.'
            }
          </p>
          {!searchTerm && Object.keys(filters).length === 0 && (
            <button
              onClick={() => navigate('/add-booking')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create First Booking
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} bookings
        </div>
        {(searchTerm || Object.keys(filters).length > 0) && (
          <div className="text-sm text-gray-500">
            {searchTerm && `Search: "${searchTerm}"`}
            {searchTerm && Object.keys(filters).length > 0 && ' • '}
            {Object.keys(filters).length > 0 && `${Object.keys(filters).length} filter(s) applied`}
          </div>
        )}
      </div>

      {/* Booking cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {bookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            onView={handleViewBooking}
            onEdit={handleEditBooking}
            onDelete={handleDeleteBooking}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPageNumbers={true}
            maxVisiblePages={5}
          />
        </div>
      )}
    </div>
  );
};

export default BookingList;
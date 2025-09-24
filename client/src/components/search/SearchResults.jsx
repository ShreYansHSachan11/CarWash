import { BookingCard } from '../booking';
import { LoadingSpinner, ErrorMessage } from '../ui';

const SearchResults = ({ 
  results, 
  isLoading, 
  error, 
  searchTerm,
  onBookingClick,
  className = ""
}) => {

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? `No results found for "${searchTerm}"` : 'No bookings found'}
        </h3>
        <p className="text-gray-500">
          {searchTerm 
            ? 'Try adjusting your search terms or filters.' 
            : 'Get started by creating your first booking.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        {results.length} result{results.length !== 1 ? 's' : ''} 
        {searchTerm && ` for "${searchTerm}"`}
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            onClick={() => onBookingClick && onBookingClick(booking)}
            className="hover:shadow-lg transition-shadow"
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
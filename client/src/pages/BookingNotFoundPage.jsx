import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Calendar } from 'lucide-react';
import Button from '../components/ui/Button';

const BookingNotFoundPage = ({ bookingId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <Search className="h-12 w-12 text-red-600" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h1>
          
          {/* Message */}
          <p className="text-gray-600 mb-2">
            {bookingId 
              ? `We couldn't find a booking with ID: ${bookingId}`
              : 'The booking you\'re looking for doesn\'t exist or may have been deleted.'
            }
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            This could happen if the booking was recently deleted or if you followed an outdated link.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="inline-flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Link to="/">
              <Button
                variant="primary"
                className="w-full sm:w-auto inline-flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                View All Bookings
              </Button>
            </Link>
          </div>
          
          {/* Additional actions */}
          <div className="text-center">
            <Link
              to="/add-booking"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Create a New Booking
            </Link>
          </div>
        </div>

        {/* Help section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            What you can do:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Check if you have the correct booking ID or link
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Browse all bookings to find what you're looking for
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Create a new booking if needed
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
              Contact support if you believe this is an error
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingNotFoundPage;
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ShareBooking from './ShareBooking';

const ShareButton = ({ booking, className = '', children }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Share button clicked for booking:', booking?._id);
          setShowShareModal(true);
        }}
        className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${className}`}
      >
        <Share2 className="h-4 w-4 mr-2" />
        {children || 'Share Booking'}
      </button>

      <ShareBooking
        booking={booking}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
};

export default ShareButton;
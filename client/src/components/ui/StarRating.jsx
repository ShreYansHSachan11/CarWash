import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readOnly = false, 
  size = 24,
  className = '' 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleStarClick = (starValue) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readOnly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const getStarColor = (starIndex) => {
    const currentRating = hoverRating || rating;
    return starIndex <= currentRating ? 'text-yellow-400' : 'text-gray-300';
  };

  const getStarFill = (starIndex) => {
    const currentRating = hoverRating || rating;
    return starIndex <= currentRating ? 'fill-current' : 'fill-none';
  };

  return (
    <div 
      className={`flex items-center space-x-1 ${className}`}
      onMouseLeave={handleMouseLeave}
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `Rating: ${rating} out of 5 stars` : "Rate this service"}
    >
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          className={`
            ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded'} 
            transition-all duration-150 ease-in-out
            ${getStarColor(starValue)}
          `}
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          disabled={readOnly}
          aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
          aria-pressed={!readOnly && rating === starValue}
          role={readOnly ? "presentation" : "radio"}
          aria-checked={!readOnly && rating === starValue}
          tabIndex={readOnly ? -1 : 0}
        >
          <Star 
            size={size} 
            className={`${getStarFill(starValue)} stroke-current`}
            aria-hidden="true"
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-gray-600" aria-hidden="true">
          ({rating}/5)
        </span>
      )}
    </div>
  );
};

export default StarRating;
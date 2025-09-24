import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useSort = (initialSortBy = 'createdAt', initialSortOrder = 'desc') => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize sort state from URL params or defaults
  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get('sortBy') || initialSortBy;
  });
  
  const [sortOrder, setSortOrder] = useState(() => {
    return searchParams.get('sortOrder') || initialSortOrder;
  });

  // Update URL when sort changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sortBy);
    newParams.set('sortOrder', sortOrder);
    setSearchParams(newParams, { replace: true });
  }, [sortBy, sortOrder, searchParams, setSearchParams]);

  const updateSort = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const getSortParams = useCallback(() => {
    return {
      sortBy,
      sortOrder
    };
  }, [sortBy, sortOrder]);

  // Function to sort an array of bookings locally
  const sortBookings = useCallback((bookings) => {
    if (!bookings || bookings.length === 0) return bookings;

    return [...bookings].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'customerName':
          aValue = a.customerName || '';
          bValue = b.customerName || '';
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'desc' ? -comparison : comparison;
      }

      // Handle numeric and date comparison
      if (aValue < bValue) {
        return sortOrder === 'desc' ? 1 : -1;
      }
      if (aValue > bValue) {
        return sortOrder === 'desc' ? -1 : 1;
      }
      return 0;
    });
  }, [sortBy, sortOrder]);

  return {
    sortBy,
    sortOrder,
    updateSort,
    getSortParams,
    sortBookings
  };
};
import { useState, useCallback } from 'react';
import { bookingAPI } from '../services/api';

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const performSearch = useCallback(async (term, filters = {}) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchTerm(term);

    try {
      if (!term.trim()) {
        // If search term is empty, get all bookings with current filters
        const response = await bookingAPI.getBookings(filters);
        setSearchResults(response.bookings || []);
      } else {
        // Perform search with the term and filters
        const searchParams = {
          search: term.trim(),
          ...filters
        };
        const response = await bookingAPI.searchBookings(searchParams);
        setSearchResults(response.bookings || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error.response?.data?.error?.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
    setIsSearching(false);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    searchTerm,
    performSearch,
    clearSearch
  };
};
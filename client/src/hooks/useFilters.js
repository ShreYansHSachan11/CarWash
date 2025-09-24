import { useState, useCallback } from 'react';
import { bookingAPI } from '../services/api';

export const useFilters = () => {
  const [filters, setFilters] = useState({
    serviceType: [],
    carType: [],
    status: [],
    dateFrom: '',
    dateTo: '',
    minPrice: '',
    maxPrice: ''
  });
  
  const [filteredResults, setFilteredResults] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState(null);

  const applyFilters = useCallback(async (searchTerm = '') => {
    setIsFiltering(true);
    setFilterError(null);

    try {
      // Build filter parameters
      const filterParams = {};
      
      // Add array filters
      if (filters.serviceType.length > 0) {
        filterParams.serviceType = filters.serviceType;
      }
      if (filters.carType.length > 0) {
        filterParams.carType = filters.carType;
      }
      if (filters.status.length > 0) {
        filterParams.status = filters.status;
      }
      
      // Add date filters
      if (filters.dateFrom) {
        filterParams.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        filterParams.dateTo = filters.dateTo;
      }
      
      // Add price filters
      if (filters.minPrice) {
        filterParams.minPrice = filters.minPrice;
      }
      if (filters.maxPrice) {
        filterParams.maxPrice = filters.maxPrice;
      }

      // Add search term if provided
      if (searchTerm.trim()) {
        filterParams.search = searchTerm.trim();
      }

      // Use search endpoint if there's a search term, otherwise use regular getBookings
      let response;
      if (searchTerm.trim()) {
        response = await bookingAPI.searchBookings(filterParams);
      } else {
        response = await bookingAPI.getBookings(filterParams);
      }
      
      setFilteredResults(response.bookings || []);
    } catch (error) {
      console.error('Filter error:', error);
      setFilterError(error.response?.data?.error?.message || 'Filter operation failed');
      setFilteredResults([]);
    } finally {
      setIsFiltering(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      serviceType: [],
      carType: [],
      status: [],
      dateFrom: '',
      dateTo: '',
      minPrice: '',
      maxPrice: ''
    });
    setFilteredResults([]);
    setFilterError(null);
  }, []);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.serviceType.length > 0 ||
      filters.carType.length > 0 ||
      filters.status.length > 0 ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.minPrice ||
      filters.maxPrice
    );
  }, [filters]);

  return {
    filters,
    filteredResults,
    isFiltering,
    filterError,
    updateFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters
  };
};
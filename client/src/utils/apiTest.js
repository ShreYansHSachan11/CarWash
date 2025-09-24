// Simple API connection test utility
import { bookingAPI } from '../services/api';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test basic connection by fetching bookings
    const response = await bookingAPI.getBookings({ page: 1, limit: 1 });
    
    console.log('✅ API connection successful!');
    console.log('Response:', response);
    
    return {
      success: true,
      message: 'API connection successful',
      data: response
    };
  } catch (error) {
    console.error('❌ API connection failed:', error);
    
    return {
      success: false,
      message: error.message || 'API connection failed',
      error: error
    };
  }
};

export const testApiEndpoints = async () => {
  const results = {
    getBookings: null,
    searchBookings: null,
    getBookingStats: null
  };

  // Test getBookings
  try {
    const bookingsResponse = await bookingAPI.getBookings();
    results.getBookings = { success: true, data: bookingsResponse };
    console.log('✅ getBookings endpoint working');
  } catch (error) {
    results.getBookings = { success: false, error: error.message };
    console.log('❌ getBookings endpoint failed:', error.message);
  }

  // Test searchBookings
  try {
    const searchResponse = await bookingAPI.searchBookings({ search: 'test' });
    results.searchBookings = { success: true, data: searchResponse };
    console.log('✅ searchBookings endpoint working');
  } catch (error) {
    results.searchBookings = { success: false, error: error.message };
    console.log('❌ searchBookings endpoint failed:', error.message);
  }

  // Test getBookingStats
  try {
    const statsResponse = await bookingAPI.getBookingStats();
    results.getBookingStats = { success: true, data: statsResponse };
    console.log('✅ getBookingStats endpoint working');
  } catch (error) {
    results.getBookingStats = { success: false, error: error.message };
    console.log('❌ getBookingStats endpoint failed:', error.message);
  }

  return results;
};
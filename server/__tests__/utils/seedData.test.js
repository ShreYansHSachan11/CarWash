import { sampleBookings } from '../../utils/seedData.js';

describe('Seed Data Utilities', () => {
  describe('Sample Data Validation', () => {
    test('should have diverse sample bookings', () => {
      expect(sampleBookings).toHaveLength(8);
      
      // Check for diversity in car types
      const carTypes = sampleBookings.map(booking => booking.carDetails.type);
      const uniqueCarTypes = [...new Set(carTypes)];
      expect(uniqueCarTypes.length).toBeGreaterThanOrEqual(5);
      
      // Check for diversity in service types
      const serviceTypes = sampleBookings.map(booking => booking.serviceType);
      const uniqueServiceTypes = [...new Set(serviceTypes)];
      expect(uniqueServiceTypes).toContain('Basic Wash');
      expect(uniqueServiceTypes).toContain('Deluxe Wash');
      expect(uniqueServiceTypes).toContain('Full Detailing');
      
      // Check for diversity in statuses
      const statuses = sampleBookings.map(booking => booking.status);
      const uniqueStatuses = [...new Set(statuses)];
      expect(uniqueStatuses.length).toBeGreaterThanOrEqual(4);
    });

    test('should have valid booking data structure', () => {
      sampleBookings.forEach((booking, index) => {
        expect(booking.customerName).toBeDefined();
        expect(booking.carDetails).toBeDefined();
        expect(booking.carDetails.make).toBeDefined();
        expect(booking.carDetails.model).toBeDefined();
        expect(booking.carDetails.year).toBeDefined();
        expect(booking.carDetails.type).toBeDefined();
        expect(booking.serviceType).toBeDefined();
        expect(booking.date).toBeInstanceOf(Date);
        expect(booking.timeSlot).toBeDefined();
        expect(booking.duration).toBeGreaterThan(0);
        expect(booking.price).toBeGreaterThan(0);
        expect(booking.status).toBeDefined();
      });
    });

    test('should have proper rating data for completed bookings', () => {
      const completedBookings = sampleBookings.filter(booking => booking.status === 'Completed');
      
      completedBookings.forEach(booking => {
        expect(booking.rating).toBeGreaterThanOrEqual(1);
        expect(booking.rating).toBeLessThanOrEqual(5);
      });
    });

    test('should cover all car types', () => {
      const carTypes = sampleBookings.map(booking => booking.carDetails.type);
      const uniqueCarTypes = [...new Set(carTypes)];
      
      // Should have at least 5 different car types
      expect(uniqueCarTypes.length).toBeGreaterThanOrEqual(5);
      
      // Check for specific car types
      expect(uniqueCarTypes).toContain('sedan');
      expect(uniqueCarTypes).toContain('SUV');
      expect(uniqueCarTypes).toContain('hatchback');
      expect(uniqueCarTypes).toContain('luxury');
      expect(uniqueCarTypes).toContain('truck');
    });

    test('should cover all service types', () => {
      const serviceTypes = sampleBookings.map(booking => booking.serviceType);
      const uniqueServiceTypes = [...new Set(serviceTypes)];
      
      // Should have all 3 service types
      expect(uniqueServiceTypes.length).toBe(3);
      expect(uniqueServiceTypes).toContain('Basic Wash');
      expect(uniqueServiceTypes).toContain('Deluxe Wash');
      expect(uniqueServiceTypes).toContain('Full Detailing');
    });

    test('should cover all booking statuses', () => {
      const statuses = sampleBookings.map(booking => booking.status);
      const uniqueStatuses = [...new Set(statuses)];
      
      // Should have at least 4 different statuses
      expect(uniqueStatuses.length).toBeGreaterThanOrEqual(4);
      expect(uniqueStatuses).toContain('Pending');
      expect(uniqueStatuses).toContain('Confirmed');
      expect(uniqueStatuses).toContain('Completed');
      expect(uniqueStatuses).toContain('In Progress');
    });

    test('should have realistic pricing', () => {
      sampleBookings.forEach(booking => {
        // Basic validation of pricing
        expect(booking.price).toBeGreaterThan(0);
        expect(booking.price).toBeLessThan(200); // Reasonable upper limit
        
        // Check that pricing makes sense for service type
        if (booking.serviceType === 'Basic Wash') {
          expect(booking.price).toBeGreaterThanOrEqual(15);
        } else if (booking.serviceType === 'Deluxe Wash') {
          expect(booking.price).toBeGreaterThanOrEqual(25);
        } else if (booking.serviceType === 'Full Detailing') {
          expect(booking.price).toBeGreaterThanOrEqual(50);
        }
      });
    });
  });
});
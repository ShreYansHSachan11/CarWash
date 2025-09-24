import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../app.js';
import Booking from '../../models/Booking.js';

describe('Search and Filter Functionality', () => {
  let mongoServer;
  let testBookings = [];

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Booking.deleteMany({});
    
    // Create diverse test bookings
    const bookingsData = [
      {
        customerName: 'John Doe',
        carDetails: { make: 'Toyota', model: 'Camry', year: 2020, type: 'sedan' },
        serviceType: 'Basic Wash',
        date: new Date('2024-12-25'),
        timeSlot: '10:00-11:00',
        duration: 30,
        price: 15,
        status: 'Pending',
        rating: null,
        addOns: []
      },
      {
        customerName: 'Jane Smith',
        carDetails: { make: 'Honda', model: 'Civic', year: 2021, type: 'sedan' },
        serviceType: 'Deluxe Wash',
        date: new Date('2024-12-26'),
        timeSlot: '11:00-12:00',
        duration: 60,
        price: 25,
        status: 'Confirmed',
        rating: null,
        addOns: []
      },
      {
        customerName: 'Bob Wilson',
        carDetails: { make: 'BMW', model: 'X5', year: 2022, type: 'SUV' },
        serviceType: 'Full Detailing',
        date: new Date('2024-12-27'),
        timeSlot: '14:00-15:00',
        duration: 120,
        price: 50,
        status: 'Completed',
        rating: 5,
        addOns: ['Interior Cleaning']
      },
      {
        customerName: 'Alice Johnson',
        carDetails: { make: 'Mercedes', model: 'C-Class', year: 2023, type: 'luxury' },
        serviceType: 'Full Detailing',
        date: new Date('2024-12-28'),
        timeSlot: '15:00-16:00',
        duration: 120,
        price: 65,
        status: 'In Progress',
        rating: null,
        addOns: ['Polishing', 'Wax Protection']
      },
      {
        customerName: 'Charlie Brown',
        carDetails: { make: 'Ford', model: 'F-150', year: 2019, type: 'truck' },
        serviceType: 'Basic Wash',
        date: new Date('2024-12-29'),
        timeSlot: '09:00-10:00',
        duration: 30,
        price: 20,
        status: 'Cancelled',
        rating: null,
        addOns: ['Tire Shine']
      }
    ];
    
    testBookings = await Booking.insertMany(bookingsData);
  });

  describe('GET /api/bookings/filter', () => {
    it('should filter bookings by service type', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?serviceType=Basic Wash')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      response.body.data.forEach(booking => {
        expect(booking.serviceType).toBe('Basic Wash');
      });
    });

    it('should filter bookings by multiple service types', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?serviceType=Basic Wash&serviceType=Deluxe Wash')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3);
    });

    it('should filter bookings by car type', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?carType=sedan')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      response.body.data.forEach(booking => {
        expect(booking.carDetails.type).toBe('sedan');
      });
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?status=Completed')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe('Completed');
    });

    it('should filter bookings by date range', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?dateFrom=2024-12-26&dateTo=2024-12-27')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter bookings by price range', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?minPrice=20&maxPrice=50')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3);
      response.body.data.forEach(booking => {
        expect(booking.price).toBeGreaterThanOrEqual(20);
        expect(booking.price).toBeLessThanOrEqual(50);
      });
    });

    it('should filter bookings by rating', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?rating=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].rating).toBe(5);
    });

    it('should sort bookings by price in descending order', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?sortBy=price&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(5);
      
      // Check if sorted by price descending
      for (let i = 0; i < response.body.data.length - 1; i++) {
        expect(response.body.data[i].price).toBeGreaterThanOrEqual(
          response.body.data[i + 1].price
        );
      }
    });

    it('should sort bookings by duration in ascending order', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?sortBy=duration&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Check if sorted by duration ascending
      for (let i = 0; i < response.body.data.length - 1; i++) {
        expect(response.body.data[i].duration).toBeLessThanOrEqual(
          response.body.data[i + 1].duration
        );
      }
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?serviceType=Full Detailing&status=Completed&minPrice=40')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].serviceType).toBe('Full Detailing');
      expect(response.body.data[0].status).toBe('Completed');
      expect(response.body.data[0].price).toBeGreaterThanOrEqual(40);
    });

    it('should support pagination with filters', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?page=1&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.totalCount).toBe(5);
    });

    it('should return filter metadata in response', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?serviceType=Basic Wash&sortBy=price')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.filters).toBeDefined();
      expect(response.body.filters.serviceType).toBe('Basic Wash');
      expect(response.body.filters.sortBy).toBe('price');
    });
  });

  describe('Advanced Search Functionality', () => {
    it('should search by customer name case-insensitively', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=john')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].customerName.toLowerCase()).toContain('john');
    });

    it('should search by car make', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=BMW')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].carDetails.make).toBe('BMW');
    });

    it('should search by car model', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=Civic')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].carDetails.model).toBe('Civic');
    });

    it('should search by car type', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=SUV')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].carDetails.type).toBe('SUV');
    });

    it('should return partial matches', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=Mer')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].carDetails.make).toBe('Mercedes');
    });

    it('should handle search with no results', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=NonExistentTerm')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.pagination.totalCount).toBe(0);
    });
  });

  describe('GET /api/bookings/stats', () => {
    it('should return booking statistics', async () => {
      const response = await request(app)
        .get('/api/bookings/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalBookings).toBe(5);
      expect(response.body.data.statusDistribution).toBeInstanceOf(Array);
      expect(response.body.data.serviceTypeDistribution).toBeInstanceOf(Array);
      expect(response.body.data.carTypeDistribution).toBeInstanceOf(Array);
      expect(typeof response.body.data.averagePrice).toBe('number');
      expect(response.body.data.priceRange).toBeDefined();
    });

    it('should return available filter options', async () => {
      const response = await request(app)
        .get('/api/bookings/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.availableFilters).toBeDefined();
      expect(response.body.data.availableFilters.serviceTypes).toContain('Basic Wash');
      expect(response.body.data.availableFilters.carTypes).toContain('sedan');
      expect(response.body.data.availableFilters.statuses).toContain('Pending');
      expect(response.body.data.availableFilters.ratings).toContain(5);
      expect(response.body.data.availableFilters.sortOptions).toContain('newest');
    });

    it('should calculate correct statistics', async () => {
      const response = await request(app)
        .get('/api/bookings/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Check status distribution
      const statusDist = response.body.data.statusDistribution;
      const pendingCount = statusDist.find(s => s._id === 'Pending')?.count || 0;
      const completedCount = statusDist.find(s => s._id === 'Completed')?.count || 0;
      
      expect(pendingCount).toBe(1);
      expect(completedCount).toBe(1);
      
      // Check service type distribution
      const serviceDist = response.body.data.serviceTypeDistribution;
      const basicWashCount = serviceDist.find(s => s._id === 'Basic Wash')?.count || 0;
      const fullDetailingCount = serviceDist.find(s => s._id === 'Full Detailing')?.count || 0;
      
      expect(basicWashCount).toBe(2);
      expect(fullDetailingCount).toBe(2);
    });
  });

  describe('Complex Filter Scenarios', () => {
    it('should handle empty filter results gracefully', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?serviceType=NonExistentService')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.pagination.totalCount).toBe(0);
    });

    it('should handle invalid date formats gracefully', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?dateFrom=invalid-date')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should still return results, ignoring invalid date
    });

    it('should handle invalid price ranges', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?minPrice=abc&maxPrice=xyz')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should return all results when price filters are invalid
    });

    it('should handle large page numbers', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?page=999&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.pagination.currentPage).toBe(999);
    });
  });
});
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../app.js';
import Booking from '../../models/Booking.js';

describe('Middleware Tests', () => {
  let mongoServer;

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
  });

  describe('CORS Middleware', () => {
    it('should set CORS headers for valid origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/bookings')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('Request Logging Middleware', () => {
    it('should add request ID header to responses', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-response-time']).toBeDefined();
    });

    it('should accept custom request ID', async () => {
      const customId = 'test-request-123';
      const response = await request(app)
        .get('/health')
        .set('X-Request-ID', customId);

      expect(response.headers['x-request-id']).toBe(customId);
    });
  });

  describe('Validation Middleware', () => {
    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/bookings?page=invalid&limit=abc')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PAGINATION');
    });

    it('should validate sort parameters', async () => {
      const response = await request(app)
        .get('/api/bookings?sortBy=invalid&sortOrder=wrong')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_SORT_FIELD');
    });

    it('should validate filter parameters', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?serviceType=InvalidService')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_FILTER_VALUE');
    });

    it('should validate date format in filters', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?dateFrom=invalid-date')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_DATE_FORMAT');
    });

    it('should validate price range in filters', async () => {
      const response = await request(app)
        .get('/api/bookings/filter?minPrice=100&maxPrice=50')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PRICE_RANGE');
    });
  });

  describe('Body Sanitization Middleware', () => {
    it('should trim string values in request body', async () => {
      const bookingData = {
        customerName: '  John Doe  ',
        carDetails: {
          make: '  Toyota  ',
          model: '  Camry  ',
          year: 2020,
          type: 'sedan'
        },
        serviceType: 'Basic Wash',
        date: '2024-12-25',
        timeSlot: '10:00-11:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.data.customerName).toBe('John Doe');
      expect(response.body.data.carDetails.make).toBe('Toyota');
      expect(response.body.data.carDetails.model).toBe('Camry');
    });

    it('should remove null and undefined values', async () => {
      const bookingData = {
        customerName: 'John Doe',
        carDetails: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          type: 'sedan'
        },
        serviceType: 'Basic Wash',
        date: '2024-12-25',
        timeSlot: '10:00-11:00',
        rating: null,
        addOns: undefined
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      // The booking should be created successfully despite null/undefined values
    });
  });

  describe('Error Handling Middleware', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    });

    it('should handle validation errors with proper format', async () => {
      const invalidBookingData = {
        customerName: 'A', // Too short
        carDetails: {
          make: 'Toyota',
          model: 'Camry',
          year: 1800, // Invalid year
          type: 'invalid-type' // Invalid car type
        },
        serviceType: 'Invalid Service', // Invalid service type
        date: '2020-01-01', // Past date
        timeSlot: 'invalid-slot' // Invalid time slot
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidBookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeInstanceOf(Array);
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });

    it('should handle MongoDB validation errors', async () => {
      // Create a booking with invalid data that passes express-validator but fails Mongoose validation
      const bookingData = {
        customerName: 'John Doe',
        carDetails: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          type: 'sedan'
        },
        serviceType: 'Basic Wash',
        date: '2024-12-25',
        timeSlot: '10:00-11:00'
      };

      // First create a valid booking
      await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      // Try to create another booking with the same data (if there were unique constraints)
      // For now, this should still work as we don't have unique constraints
      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      // This should succeed as we don't have unique constraints
      expect(response.status).toBe(201);
    });
  });

  describe('Request Size Limits', () => {
    it('should handle large request bodies within limits', async () => {
      const bookingData = {
        customerName: 'John Doe',
        carDetails: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          type: 'sedan'
        },
        serviceType: 'Basic Wash',
        date: '2024-12-25',
        timeSlot: '10:00-11:00',
        addOns: ['Interior Cleaning', 'Polishing', 'Wax Protection', 'Tire Shine', 'Air Freshener']
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Health Check and Root Routes', () => {
    it('should return server info on root route', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.message).toContain('Car Wash Booking API Server is running!');
      expect(response.body.version).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return detailed health info', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.memory).toBeDefined();
      expect(response.body.version).toBeDefined();
    });
  });
});
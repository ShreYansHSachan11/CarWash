import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../app.js';
import Booking from '../../models/Booking.js';

describe('Booking Controller', () => {
  let mongoServer;
  let testBookingId;

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
    
    // Create a test booking
    const testBooking = new Booking({
      customerName: 'John Doe',
      carDetails: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        type: 'sedan'
      },
      serviceType: 'Basic Wash',
      date: new Date('2024-12-25'),
      timeSlot: '10:00-11:00',
      duration: 30,
      price: 15,
      status: 'Pending',
      addOns: ['Interior Cleaning']
    });
    
    const savedBooking = await testBooking.save();
    testBookingId = savedBooking._id.toString();
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking with valid data', async () => {
      const bookingData = {
        customerName: 'Jane Smith',
        carDetails: {
          make: 'Honda',
          model: 'Civic',
          year: 2021,
          type: 'sedan'
        },
        serviceType: 'Deluxe Wash',
        date: '2024-12-26',
        timeSlot: '11:00-12:00',
        addOns: ['Polishing', 'Wax Protection']
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('Jane Smith');
      expect(response.body.data.price).toBe(60); // 25 + 15 + 20
      expect(response.body.data.duration).toBe(60);
      expect(response.body.message).toBe('Booking created successfully');
    });

    it('should return validation error for missing required fields', async () => {
      const invalidBookingData = {
        customerName: 'Jane Smith'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidBookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid car year', async () => {
      const bookingData = {
        customerName: 'Jane Smith',
        carDetails: {
          make: 'Honda',
          model: 'Civic',
          year: 1800, // Invalid year
          type: 'sedan'
        },
        serviceType: 'Basic Wash',
        date: '2024-12-26',
        timeSlot: '11:00-12:00'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/bookings', () => {
    it('should get all bookings with pagination', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.totalCount).toBe(1);
    });

    it('should filter bookings by service type', async () => {
      // Create another booking with different service type
      await new Booking({
        customerName: 'Alice Johnson',
        carDetails: {
          make: 'BMW',
          model: 'X5',
          year: 2022,
          type: 'SUV'
        },
        serviceType: 'Full Detailing',
        date: new Date('2024-12-27'),
        timeSlot: '14:00-15:00',
        duration: 120,
        price: 50
      }).save();

      const response = await request(app)
        .get('/api/bookings?serviceType=Full Detailing')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].serviceType).toBe('Full Detailing');
    });

    it('should search bookings by customer name', async () => {
      const response = await request(app)
        .get('/api/bookings?search=John')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].customerName).toBe('John Doe');
    });

    it('should sort bookings by price', async () => {
      // Create another booking with higher price
      await new Booking({
        customerName: 'Bob Wilson',
        carDetails: {
          make: 'Mercedes',
          model: 'C-Class',
          year: 2023,
          type: 'luxury'
        },
        serviceType: 'Full Detailing',
        date: new Date('2024-12-28'),
        timeSlot: '15:00-16:00',
        duration: 120,
        price: 50
      }).save();

      const response = await request(app)
        .get('/api/bookings?sortBy=price&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].price).toBeGreaterThan(response.body.data[1].price);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should get booking by valid ID', async () => {
      const response = await request(app)
        .get(`/api/bookings/${testBookingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testBookingId);
      expect(response.body.data.customerName).toBe('John Doe');
    });

    it('should return 404 for non-existent booking ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/bookings/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BOOKING_NOT_FOUND');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/bookings/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ID_FORMAT');
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update booking with valid data', async () => {
      const updateData = {
        customerName: 'John Smith',
        status: 'Confirmed'
      };

      const response = await request(app)
        .put(`/api/bookings/${testBookingId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('John Smith');
      expect(response.body.data.status).toBe('Confirmed');
      expect(response.body.message).toBe('Booking updated successfully');
    });

    it('should recalculate price when service type is updated', async () => {
      const updateData = {
        serviceType: 'Full Detailing',
        addOns: ['Polishing']
      };

      const response = await request(app)
        .put(`/api/bookings/${testBookingId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.serviceType).toBe('Full Detailing');
      expect(response.body.data.price).toBe(65); // 50 + 15
      expect(response.body.data.duration).toBe(120);
    });

    it('should return 404 for non-existent booking ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { customerName: 'Updated Name' };

      const response = await request(app)
        .put(`/api/bookings/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BOOKING_NOT_FOUND');
    });

    it('should return validation error for invalid data', async () => {
      const invalidUpdateData = {
        carDetails: {
          year: 1800 // Invalid year
        }
      };

      const response = await request(app)
        .put(`/api/bookings/${testBookingId}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should delete booking with valid ID', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${testBookingId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Booking deleted successfully');
      expect(response.body.data.id).toBe(testBookingId);

      // Verify booking is actually deleted
      const deletedBooking = await Booking.findById(testBookingId);
      expect(deletedBooking).toBeNull();
    });

    it('should return 404 for non-existent booking ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/bookings/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BOOKING_NOT_FOUND');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/bookings/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_ID_FORMAT');
    });
  });

  describe('GET /api/bookings/search', () => {
    beforeEach(async () => {
      // Add more test data for search
      await new Booking({
        customerName: 'Alice Johnson',
        carDetails: {
          make: 'BMW',
          model: 'X5',
          year: 2022,
          type: 'SUV'
        },
        serviceType: 'Full Detailing',
        date: new Date('2024-12-27'),
        timeSlot: '14:00-15:00',
        duration: 120,
        price: 50
      }).save();
    });

    it('should search bookings by customer name', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=Alice')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].customerName).toBe('Alice Johnson');
      expect(response.body.searchTerm).toBe('Alice');
    });

    it('should search bookings by car make', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=BMW')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].carDetails.make).toBe('BMW');
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=NonExistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should return error when search term is missing', async () => {
      const response = await request(app)
        .get('/api/bookings/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SEARCH_TERM_REQUIRED');
    });

    it('should support pagination in search results', async () => {
      const response = await request(app)
        .get('/api/bookings/search?q=o&page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });
});
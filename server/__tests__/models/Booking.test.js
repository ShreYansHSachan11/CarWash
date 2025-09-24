import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Booking from '../../models/Booking.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Booking.deleteMany({});
});

describe('Booking Model', () => {
  const validBookingData = {
    customerName: 'John Doe',
    carDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      type: 'sedan'
    },
    serviceType: 'Basic Wash',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    timeSlot: '10:00-11:00',
    duration: 30,
    price: 15,
    status: 'Pending',
    addOns: ['Interior Cleaning']
  };

  describe('Schema Validation', () => {
    test('should create a valid booking', async () => {
      const booking = new Booking(validBookingData);
      const savedBooking = await booking.save();
      
      expect(savedBooking._id).toBeDefined();
      expect(savedBooking.customerName).toBe('John Doe');
      expect(savedBooking.carDetails.make).toBe('Toyota');
      expect(savedBooking.serviceType).toBe('Basic Wash');
      expect(savedBooking.status).toBe('Pending');
      expect(savedBooking.createdAt).toBeDefined();
      expect(savedBooking.updatedAt).toBeDefined();
    });

    test('should require customerName', async () => {
      const booking = new Booking({ ...validBookingData, customerName: undefined });
      
      await expect(booking.save()).rejects.toThrow('Customer name is required');
    });

    test('should validate customerName length', async () => {
      const booking = new Booking({ ...validBookingData, customerName: 'A' });
      
      await expect(booking.save()).rejects.toThrow('Customer name must be at least 2 characters long');
    });

    test('should validate customerName max length', async () => {
      const longName = 'A'.repeat(101);
      const booking = new Booking({ ...validBookingData, customerName: longName });
      
      await expect(booking.save()).rejects.toThrow('Customer name cannot exceed 100 characters');
    });

    test('should require car details', async () => {
      const booking = new Booking({ ...validBookingData, carDetails: { make: 'Toyota' } });
      
      await expect(booking.save()).rejects.toThrow();
    });

    test('should validate car year range', async () => {
      const booking = new Booking({
        ...validBookingData,
        carDetails: { ...validBookingData.carDetails, year: 1800 }
      });
      
      await expect(booking.save()).rejects.toThrow('Car year must be 1900 or later');
    });

    test('should validate car type enum', async () => {
      const booking = new Booking({
        ...validBookingData,
        carDetails: { ...validBookingData.carDetails, type: 'invalid' }
      });
      
      await expect(booking.save()).rejects.toThrow();
    });

    test('should validate service type enum', async () => {
      const booking = new Booking({ ...validBookingData, serviceType: 'Invalid Service' });
      
      await expect(booking.save()).rejects.toThrow();
    });

    test('should validate date is not in the past', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const booking = new Booking({ ...validBookingData, date: pastDate });
      
      await expect(booking.save()).rejects.toThrow('Booking date cannot be in the past');
    });

    test('should validate time slot enum', async () => {
      const booking = new Booking({ ...validBookingData, timeSlot: '25:00-26:00' });
      
      await expect(booking.save()).rejects.toThrow('Invalid time slot');
    });

    test('should validate duration range', async () => {
      const booking = new Booking({ ...validBookingData, duration: 20 });
      
      await expect(booking.save()).rejects.toThrow('Duration must be at least 30 minutes');
    });

    test('should validate price is not negative', async () => {
      const booking = new Booking({ ...validBookingData, price: -10 });
      
      await expect(booking.save()).rejects.toThrow('Price cannot be negative');
    });

    test('should validate status enum', async () => {
      const booking = new Booking({ ...validBookingData, status: 'Invalid Status' });
      
      await expect(booking.save()).rejects.toThrow();
    });

    test('should validate rating range', async () => {
      const booking = new Booking({ ...validBookingData, rating: 6 });
      
      await expect(booking.save()).rejects.toThrow('Rating cannot exceed 5');
    });

    test('should validate rating only for completed bookings', async () => {
      const booking = new Booking({ ...validBookingData, rating: 5, status: 'Pending' });
      
      await expect(booking.save()).rejects.toThrow('Rating can only be set for completed bookings');
    });

    test('should allow rating for completed bookings', async () => {
      const booking = new Booking({ ...validBookingData, rating: 5, status: 'Completed' });
      const savedBooking = await booking.save();
      
      expect(savedBooking.rating).toBe(5);
    });

    test('should validate add-ons enum', async () => {
      const booking = new Booking({ ...validBookingData, addOns: ['Invalid Add-on'] });
      
      await expect(booking.save()).rejects.toThrow('Invalid add-on service');
    });
  });

  describe('Pre-save Middleware', () => {
    test('should update updatedAt on save', async () => {
      const booking = new Booking(validBookingData);
      const savedBooking = await booking.save();
      
      const originalUpdatedAt = savedBooking.updatedAt;
      
      // Wait a bit and update
      await new Promise(resolve => setTimeout(resolve, 10));
      savedBooking.customerName = 'Jane Doe';
      await savedBooking.save();
      
      expect(savedBooking.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    test('should update updatedAt on findOneAndUpdate', async () => {
      const booking = new Booking(validBookingData);
      const savedBooking = await booking.save();
      
      const originalUpdatedAt = savedBooking.updatedAt;
      
      // Wait a bit and update
      await new Promise(resolve => setTimeout(resolve, 10));
      const updatedBooking = await Booking.findOneAndUpdate(
        { _id: savedBooking._id },
        { customerName: 'Jane Doe' },
        { new: true }
      );
      
      expect(updatedBooking.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Instance Methods', () => {
    test('calculateTotalPrice should calculate correct price with no add-ons', async () => {
      const booking = new Booking({ ...validBookingData, addOns: [] });
      const totalPrice = booking.calculateTotalPrice();
      
      expect(totalPrice).toBe(15); // Basic Wash base price
    });

    test('calculateTotalPrice should calculate correct price with add-ons', async () => {
      const booking = new Booking({
        ...validBookingData,
        serviceType: 'Deluxe Wash',
        addOns: ['Interior Cleaning', 'Tire Shine']
      });
      const totalPrice = booking.calculateTotalPrice();
      
      expect(totalPrice).toBe(40); // 25 (Deluxe) + 10 (Interior) + 5 (Tire Shine)
    });

    test('getServiceDuration should return correct duration', async () => {
      const booking = new Booking({ ...validBookingData, serviceType: 'Full Detailing' });
      const duration = booking.getServiceDuration();
      
      expect(duration).toBe(120); // Full Detailing duration
    });
  });

  describe('Static Methods', () => {
    test('getAvailableTimeSlots should return all time slots', () => {
      const timeSlots = Booking.getAvailableTimeSlots();
      
      expect(timeSlots).toHaveLength(8);
      expect(timeSlots).toContain('09:00-10:00');
      expect(timeSlots).toContain('16:00-17:00');
    });

    test('getServicePricing should return pricing object', () => {
      const pricing = Booking.getServicePricing();
      
      expect(pricing['Basic Wash'].basePrice).toBe(15);
      expect(pricing['Deluxe Wash'].basePrice).toBe(25);
      expect(pricing['Full Detailing'].basePrice).toBe(50);
    });

    test('getAddOnPricing should return add-on pricing object', () => {
      const addOnPricing = Booking.getAddOnPricing();
      
      expect(addOnPricing['Interior Cleaning']).toBe(10);
      expect(addOnPricing['Polishing']).toBe(15);
      expect(addOnPricing['Wax Protection']).toBe(20);
    });
  });

  describe('Virtual Fields', () => {
    test('formattedDate should return formatted date string', async () => {
      const booking = new Booking(validBookingData);
      const savedBooking = await booking.save();
      
      expect(savedBooking.formattedDate).toBeDefined();
      expect(typeof savedBooking.formattedDate).toBe('string');
    });

    test('ageInDays should return correct age', async () => {
      const booking = new Booking(validBookingData);
      const savedBooking = await booking.save();
      
      expect(savedBooking.ageInDays).toBe(1); // Should be 1 day old (created today)
    });
  });

  describe('Default Values', () => {
    test('should set default status to Pending', async () => {
      const bookingData = { ...validBookingData };
      delete bookingData.status;
      
      const booking = new Booking(bookingData);
      const savedBooking = await booking.save();
      
      expect(savedBooking.status).toBe('Pending');
    });

    test('should set default rating to null', async () => {
      const booking = new Booking(validBookingData);
      const savedBooking = await booking.save();
      
      expect(savedBooking.rating).toBeNull();
    });

    test('should set createdAt and updatedAt timestamps', async () => {
      const booking = new Booking(validBookingData);
      const savedBooking = await booking.save();
      
      expect(savedBooking.createdAt).toBeDefined();
      expect(savedBooking.updatedAt).toBeDefined();
      expect(savedBooking.createdAt).toBeInstanceOf(Date);
      expect(savedBooking.updatedAt).toBeInstanceOf(Date);
    });
  });
});
import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  searchBookings,
  filterBookings,
  getBookingStats,
  updateBookingRating
} from '../controllers/bookingController.js';

const router = express.Router();

// Validation middleware for booking creation and updates
const bookingValidation = [
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .notEmpty()
    .withMessage('Customer name is required'),
  
  body('carDetails.make')
    .trim()
    .notEmpty()
    .withMessage('Car make is required')
    .isLength({ max: 50 })
    .withMessage('Car make cannot exceed 50 characters'),
  
  body('carDetails.model')
    .trim()
    .notEmpty()
    .withMessage('Car model is required')
    .isLength({ max: 50 })
    .withMessage('Car model cannot exceed 50 characters'),
  
  body('carDetails.year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Car year must be between 1900 and ${new Date().getFullYear() + 1}`),
  
  body('carDetails.type')
    .isIn(['sedan', 'SUV', 'hatchback', 'luxury', 'truck', 'coupe'])
    .withMessage('Car type must be one of: sedan, SUV, hatchback, luxury, truck, coupe'),
  
  body('serviceType')
    .isIn(['Basic Wash', 'Deluxe Wash', 'Full Detailing'])
    .withMessage('Service type must be one of: Basic Wash, Deluxe Wash, Full Detailing'),
  
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  
  body('timeSlot')
    .isIn(['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
           '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'])
    .withMessage('Invalid time slot'),
  
  body('status')
    .optional()
    .isIn(['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Status must be one of: Pending, Confirmed, In Progress, Completed, Cancelled'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('addOns')
    .optional()
    .isArray()
    .withMessage('Add-ons must be an array')
    .custom((addOns) => {
      const validAddOns = ['Interior Cleaning', 'Polishing', 'Wax Protection', 'Tire Shine', 'Air Freshener'];
      const invalidAddOns = addOns.filter(addOn => !validAddOns.includes(addOn));
      
      if (invalidAddOns.length > 0) {
        throw new Error(`Invalid add-ons: ${invalidAddOns.join(', ')}`);
      }
      return true;
    })
];

// Validation middleware for partial updates
const updateBookingValidation = [
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('carDetails.make')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Car make cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Car make cannot exceed 50 characters'),
  
  body('carDetails.model')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Car model cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Car model cannot exceed 50 characters'),
  
  body('carDetails.year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Car year must be between 1900 and ${new Date().getFullYear() + 1}`),
  
  body('carDetails.type')
    .optional()
    .isIn(['sedan', 'SUV', 'hatchback', 'luxury', 'truck', 'coupe'])
    .withMessage('Car type must be one of: sedan, SUV, hatchback, luxury, truck, coupe'),
  
  body('serviceType')
    .optional()
    .isIn(['Basic Wash', 'Deluxe Wash', 'Full Detailing'])
    .withMessage('Service type must be one of: Basic Wash, Deluxe Wash, Full Detailing'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bookingDate < today) {
        throw new Error('Booking date cannot be in the past');
      }
      return true;
    }),
  
  body('timeSlot')
    .optional()
    .isIn(['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
           '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'])
    .withMessage('Invalid time slot'),
  
  body('status')
    .optional()
    .isIn(['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Status must be one of: Pending, Confirmed, In Progress, Completed, Cancelled'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('addOns')
    .optional()
    .isArray()
    .withMessage('Add-ons must be an array')
    .custom((addOns) => {
      const validAddOns = ['Interior Cleaning', 'Polishing', 'Wax Protection', 'Tire Shine', 'Air Freshener'];
      const invalidAddOns = addOns.filter(addOn => !validAddOns.includes(addOn));
      
      if (invalidAddOns.length > 0) {
        throw new Error(`Invalid add-ons: ${invalidAddOns.join(', ')}`);
      }
      return true;
    })
];

// Routes

// @route   GET /api/bookings/stats
// @desc    Get booking statistics and filter options
// @access  Public
router.get('/stats', getBookingStats);

// @route   GET /api/bookings/search
// @desc    Search bookings by customer name and car details
// @access  Public
router.get('/search', searchBookings);

// @route   GET /api/bookings/filter
// @desc    Get filtered bookings with advanced filtering options
// @access  Public
router.get('/filter', filterBookings);

// @route   GET /api/bookings
// @desc    Get all bookings with pagination and basic filtering
// @access  Public
router.get('/', getBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Public
router.get('/:id', getBookingById);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Public
router.post('/', bookingValidation, createBooking);

// @route   PUT /api/bookings/:id
// @desc    Update booking by ID
// @access  Public
router.put('/:id', updateBookingValidation, updateBooking);

// @route   DELETE /api/bookings/:id
// @desc    Delete booking by ID
// @access  Public
router.delete('/:id', deleteBooking);

// @route   PATCH /api/bookings/:id/rating
// @desc    Update booking rating
// @access  Public
router.patch('/:id/rating', [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5')
], updateBookingRating);

export default router;
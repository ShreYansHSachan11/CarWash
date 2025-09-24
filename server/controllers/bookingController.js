import Booking from '../models/Booking.js';
import { validationResult } from 'express-validator';

// Helper function to handle validation errors
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  return null;
};

// Helper function to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
export const createBooking = asyncHandler(async (req, res) => {
  // Check for validation errors
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const bookingData = req.body;
    
    // Calculate price and duration based on service type and add-ons
    const booking = new Booking(bookingData);
    const calculatedPrice = booking.calculateTotalPrice();
    const serviceDuration = booking.getServiceDuration();
    
    // Update booking with calculated values
    booking.price = calculatedPrice;
    booking.duration = serviceDuration;
    
    const savedBooking = await booking.save();
    
    res.status(201).json({
      success: true,
      data: savedBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create booking',
        code: 'CREATE_BOOKING_ERROR'
      }
    });
  }
});

// @desc    Get all bookings with pagination
// @route   GET /api/bookings
// @access  Public
export const getBookings = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Add filters if provided
    if (req.query.serviceType) {
      filter.serviceType = req.query.serviceType;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.carType) {
      filter['carDetails.type'] = req.query.carType;
    }
    
    // Date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) {
        filter.date.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.date.$lte = new Date(req.query.dateTo);
      }
    }
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { customerName: searchRegex },
        { 'carDetails.make': searchRegex },
        { 'carDetails.model': searchRegex }
      ];
    }
    
    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      
      switch (sortField) {
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'price':
          sort = { price: sortOrder };
          break;
        case 'duration':
          sort = { duration: sortOrder };
          break;
        case 'status':
          sort = { status: sortOrder };
          break;
        case 'date':
          sort = { date: sortOrder };
          break;
        default:
          sort = { createdAt: -1 };
      }
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }
    
    // Execute queries
    const [bookings, totalCount] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch bookings',
        code: 'FETCH_BOOKINGS_ERROR'
      }
    });
  }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Public
export const getBookingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid booking ID format',
          code: 'INVALID_ID_FORMAT'
        }
      });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        }
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch booking',
        code: 'FETCH_BOOKING_ERROR'
      }
    });
  }
});

// @desc    Update booking by ID
// @route   PUT /api/bookings/:id
// @access  Public
export const updateBooking = asyncHandler(async (req, res) => {
  // Check for validation errors
  const validationError = handleValidationErrors(req, res);
  if (validationError) return validationError;

  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid booking ID format',
          code: 'INVALID_ID_FORMAT'
        }
      });
    }
    
    // Find the existing booking
    const existingBooking = await Booking.findById(id);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        }
      });
    }
    
    // Create a temporary booking instance to calculate price and duration
    const tempBooking = new Booking({
      ...existingBooking.toObject(),
      ...updateData
    });
    
    // Recalculate price and duration if service type or add-ons changed
    if (updateData.serviceType || updateData.addOns) {
      updateData.price = tempBooking.calculateTotalPrice();
      updateData.duration = tempBooking.getServiceDuration();
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationErrors
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update booking',
        code: 'UPDATE_BOOKING_ERROR'
      }
    });
  }
});

// @desc    Delete booking by ID
// @route   DELETE /api/bookings/:id
// @access  Public
export const deleteBooking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid booking ID format',
          code: 'INVALID_ID_FORMAT'
        }
      });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        }
      });
    }
    
    await Booking.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Booking deleted successfully',
      data: { id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete booking',
        code: 'DELETE_BOOKING_ERROR'
      }
    });
  }
});

// @desc    Search bookings by customer name and car details
// @route   GET /api/bookings/search
// @access  Public
export const searchBookings = asyncHandler(async (req, res) => {
  try {
    const { q: searchTerm, page = 1, limit = 10 } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search term is required',
          code: 'SEARCH_TERM_REQUIRED'
        }
      });
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const searchRegex = new RegExp(searchTerm, 'i');
    const searchFilter = {
      $or: [
        { customerName: searchRegex },
        { 'carDetails.make': searchRegex },
        { 'carDetails.model': searchRegex },
        { 'carDetails.type': searchRegex }
      ]
    };
    
    const [bookings, totalCount] = await Promise.all([
      Booking.find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(searchFilter)
    ]);
    
    const totalPages = Math.ceil(totalCount / limitNum);
    
    res.json({
      success: true,
      data: bookings,
      searchTerm,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Search failed',
        code: 'SEARCH_ERROR'
      }
    });
  }
});

// @desc    Get filtered bookings with advanced filtering options
// @route   GET /api/bookings/filter
// @access  Public
export const filterBookings = asyncHandler(async (req, res) => {
  try {
    const {
      serviceType,
      carType,
      status,
      dateFrom,
      dateTo,
      minPrice,
      maxPrice,
      rating,
      page = 1,
      limit = 10,
      sortBy = 'newest',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter object
    const filter = {};
    
    // Service type filter
    if (serviceType) {
      if (Array.isArray(serviceType)) {
        filter.serviceType = { $in: serviceType };
      } else {
        filter.serviceType = serviceType;
      }
    }
    
    // Car type filter
    if (carType) {
      if (Array.isArray(carType)) {
        filter['carDetails.type'] = { $in: carType };
      } else {
        filter['carDetails.type'] = carType;
      }
    }
    
    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        filter.status = { $in: status };
      } else {
        filter.status = status;
      }
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.date.$lte = new Date(dateTo);
      }
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.price.$lte = parseFloat(maxPrice);
      }
    }
    
    // Rating filter
    if (rating) {
      if (Array.isArray(rating)) {
        filter.rating = { $in: rating.map(r => parseInt(r)) };
      } else {
        filter.rating = parseInt(rating);
      }
    }
    
    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'price':
        sort = { price: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'duration':
        sort = { duration: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'status':
        sort = { status: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'date':
        sort = { date: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'rating':
        sort = { rating: sortOrder === 'desc' ? -1 : 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    // Execute queries
    const [bookings, totalCount] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(totalCount / limitNum);
    
    res.json({
      success: true,
      data: bookings,
      filters: {
        serviceType,
        carType,
        status,
        dateFrom,
        dateTo,
        minPrice,
        maxPrice,
        rating,
        sortBy,
        sortOrder
      },
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Filter operation failed',
        code: 'FILTER_ERROR'
      }
    });
  }
});

// @desc    Update booking rating
// @route   PATCH /api/bookings/:id/rating
// @access  Public
export const updateBookingRating = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid booking ID format',
          code: 'INVALID_ID_FORMAT'
        }
      });
    }
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Rating must be an integer between 1 and 5',
          code: 'INVALID_RATING'
        }
      });
    }
    
    // Find the booking
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        }
      });
    }
    
    // Check if booking is completed
    if (booking.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Only completed bookings can be rated',
          code: 'BOOKING_NOT_COMPLETED'
        }
      });
    }
    
    // Update the rating
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { rating },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedBooking,
      message: 'Rating updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update rating',
        code: 'UPDATE_RATING_ERROR'
      }
    });
  }
});

// @desc    Get booking statistics and filter options
// @route   GET /api/bookings/stats
// @access  Public
export const getBookingStats = asyncHandler(async (req, res) => {
  try {
    const [
      totalBookings,
      statusCounts,
      serviceTypeCounts,
      carTypeCounts,
      averagePrice,
      priceRange
    ] = await Promise.all([
      // Total bookings count
      Booking.countDocuments(),
      
      // Status distribution
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Service type distribution
      Booking.aggregate([
        { $group: { _id: '$serviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Car type distribution
      Booking.aggregate([
        { $group: { _id: '$carDetails.type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Average price
      Booking.aggregate([
        { $group: { _id: null, avgPrice: { $avg: '$price' } } }
      ]),
      
      // Price range
      Booking.aggregate([
        { 
          $group: { 
            _id: null, 
            minPrice: { $min: '$price' }, 
            maxPrice: { $max: '$price' } 
          } 
        }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        totalBookings,
        statusDistribution: statusCounts,
        serviceTypeDistribution: serviceTypeCounts,
        carTypeDistribution: carTypeCounts,
        averagePrice: averagePrice[0]?.avgPrice || 0,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
        availableFilters: {
          serviceTypes: ['Basic Wash', 'Deluxe Wash', 'Full Detailing'],
          carTypes: ['sedan', 'SUV', 'hatchback', 'luxury', 'truck', 'coupe'],
          statuses: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
          ratings: [1, 2, 3, 4, 5],
          sortOptions: ['newest', 'price', 'duration', 'status', 'date', 'rating']
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch booking statistics',
        code: 'STATS_ERROR'
      }
    });
  }
});
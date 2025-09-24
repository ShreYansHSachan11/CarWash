import { validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors
      }
    });
  }
  
  next();
};

// Middleware to sanitize request body
export const sanitizeBody = (req, res, next) => {
  if (req.body) {
    // Remove any undefined or null values
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === undefined || req.body[key] === null) {
        delete req.body[key];
      }
      
      // Trim string values
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
      
      // Handle nested objects (like carDetails)
      if (typeof req.body[key] === 'object' && req.body[key] !== null) {
        Object.keys(req.body[key]).forEach(nestedKey => {
          if (req.body[key][nestedKey] === undefined || req.body[key][nestedKey] === null) {
            delete req.body[key][nestedKey];
          }
          
          if (typeof req.body[key][nestedKey] === 'string') {
            req.body[key][nestedKey] = req.body[key][nestedKey].trim();
          }
        });
      }
    });
  }
  
  next();
};

// Middleware to validate pagination parameters
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Page must be a positive integer',
          code: 'INVALID_PAGINATION'
        }
      });
    }
    req.query.page = pageNum;
  }
  
  if (limit) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Limit must be a positive integer between 1 and 100',
          code: 'INVALID_PAGINATION'
        }
      });
    }
    req.query.limit = limitNum;
  }
  
  next();
};

// Middleware to validate sort parameters
export const validateSort = (req, res, next) => {
  const { sortBy, sortOrder } = req.query;
  
  const validSortFields = ['newest', 'price', 'duration', 'status', 'date', 'rating', 'createdAt'];
  const validSortOrders = ['asc', 'desc'];
  
  if (sortBy && !validSortFields.includes(sortBy)) {
    return res.status(400).json({
      success: false,
      error: {
        message: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}`,
        code: 'INVALID_SORT_FIELD'
      }
    });
  }
  
  if (sortOrder && !validSortOrders.includes(sortOrder)) {
    return res.status(400).json({
      success: false,
      error: {
        message: `Invalid sort order. Must be one of: ${validSortOrders.join(', ')}`,
        code: 'INVALID_SORT_ORDER'
      }
    });
  }
  
  next();
};

// Middleware to validate filter parameters
export const validateFilters = (req, res, next) => {
  const { serviceType, carType, status, dateFrom, dateTo, minPrice, maxPrice, rating } = req.query;
  
  const validServiceTypes = ['Basic Wash', 'Deluxe Wash', 'Full Detailing'];
  const validCarTypes = ['sedan', 'SUV', 'hatchback', 'luxury', 'truck', 'coupe'];
  const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
  const validRatings = ['1', '2', '3', '4', '5'];
  
  // Validate service type
  if (serviceType) {
    const serviceTypes = Array.isArray(serviceType) ? serviceType : [serviceType];
    const invalidServiceTypes = serviceTypes.filter(type => !validServiceTypes.includes(type));
    
    if (invalidServiceTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid service type(s): ${invalidServiceTypes.join(', ')}`,
          code: 'INVALID_FILTER_VALUE'
        }
      });
    }
  }
  
  // Validate car type
  if (carType) {
    const carTypes = Array.isArray(carType) ? carType : [carType];
    const invalidCarTypes = carTypes.filter(type => !validCarTypes.includes(type));
    
    if (invalidCarTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid car type(s): ${invalidCarTypes.join(', ')}`,
          code: 'INVALID_FILTER_VALUE'
        }
      });
    }
  }
  
  // Validate status
  if (status) {
    const statuses = Array.isArray(status) ? status : [status];
    const invalidStatuses = statuses.filter(s => !validStatuses.includes(s));
    
    if (invalidStatuses.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid status(es): ${invalidStatuses.join(', ')}`,
          code: 'INVALID_FILTER_VALUE'
        }
      });
    }
  }
  
  // Validate rating
  if (rating) {
    const ratings = Array.isArray(rating) ? rating : [rating];
    const invalidRatings = ratings.filter(r => !validRatings.includes(r));
    
    if (invalidRatings.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid rating(s): ${invalidRatings.join(', ')}`,
          code: 'INVALID_FILTER_VALUE'
        }
      });
    }
  }
  
  // Validate dates
  if (dateFrom && isNaN(Date.parse(dateFrom))) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid dateFrom format. Use ISO 8601 format (YYYY-MM-DD)',
        code: 'INVALID_DATE_FORMAT'
      }
    });
  }
  
  if (dateTo && isNaN(Date.parse(dateTo))) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid dateTo format. Use ISO 8601 format (YYYY-MM-DD)',
        code: 'INVALID_DATE_FORMAT'
      }
    });
  }
  
  // Validate price range
  if (minPrice && (isNaN(parseFloat(minPrice)) || parseFloat(minPrice) < 0)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'minPrice must be a non-negative number',
        code: 'INVALID_PRICE_RANGE'
      }
    });
  }
  
  if (maxPrice && (isNaN(parseFloat(maxPrice)) || parseFloat(maxPrice) < 0)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'maxPrice must be a non-negative number',
        code: 'INVALID_PRICE_RANGE'
      }
    });
  }
  
  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'minPrice cannot be greater than maxPrice',
        code: 'INVALID_PRICE_RANGE'
      }
    });
  }
  
  next();
};
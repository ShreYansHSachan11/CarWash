import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';

// Import middleware
import corsMiddleware from './middleware/cors.js';
import errorHandler from './middleware/errorHandler.js';
import logger, { requestTiming, requestId } from './middleware/requestLogger.js';
import { sanitizeBody, validatePagination, validateSort, validateFilters } from './middleware/validation.js';

// Import routes
import bookingRoutes from './routes/bookings.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Request timing and ID middleware
app.use(requestTiming);
app.use(requestId);

// CORS middleware
app.use(corsMiddleware);

// Request logging
app.use(logger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Body sanitization
app.use(sanitizeBody);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Car Wash Booking API Server is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// API routes with validation middleware
app.use('/api/bookings', 
  validatePagination, 
  validateSort, 
  validateFilters, 
  bookingRoutes
);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });
}

export default app;
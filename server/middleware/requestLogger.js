import morgan from 'morgan';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for request ID (if available)
morgan.token('request-id', (req) => {
  return req.id || req.headers['x-request-id'] || '-';
});

// Custom token for user agent
morgan.token('user-agent', (req) => {
  return req.get('User-Agent') || '-';
});

// Custom token for request body size
morgan.token('req-size', (req) => {
  return req.get('Content-Length') || '0';
});

// Development format - detailed logging
const developmentFormat = ':method :url :status :res[content-length] - :response-time ms - :user-agent';

// Production format - structured logging
const productionFormat = JSON.stringify({
  timestamp: ':date[iso]',
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  remoteAddr: ':remote-addr',
  requestId: ':request-id'
});

// Combined format with additional fields
const combinedFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Create different loggers for different environments
export const developmentLogger = morgan(developmentFormat, {
  skip: (req, res) => {
    // Skip logging for health check endpoints in development
    return req.url === '/health' || req.url === '/';
  }
});

export const productionLogger = morgan(combinedFormat, {
  skip: (req, res) => {
    // Skip successful health checks in production
    return (req.url === '/health' || req.url === '/') && res.statusCode < 400;
  }
});

// Error logger - only log errors
export const errorLogger = morgan(combinedFormat, {
  skip: (req, res) => res.statusCode < 400
});

// API-specific logger with more details
export const apiLogger = morgan((tokens, req, res) => {
  const log = {
    timestamp: tokens.date(req, res, 'iso'),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: `${tokens['response-time'](req, res)}ms`,
    contentLength: tokens.res(req, res, 'content-length') || '0',
    userAgent: tokens['user-agent'](req, res),
    remoteAddr: tokens['remote-addr'](req, res),
    requestSize: tokens['req-size'](req, res)
  };
  
  // Add request body info for POST/PUT requests (without sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    log.hasBody = !!req.body && Object.keys(req.body).length > 0;
    if (req.body && req.body.customerName) {
      log.customerName = req.body.customerName; // Safe to log customer name
    }
  }
  
  // Add query parameters for GET requests
  if (req.method === 'GET' && Object.keys(req.query).length > 0) {
    log.queryParams = Object.keys(req.query);
  }
  
  return JSON.stringify(log);
});

// Request timing middleware
export const requestTiming = (req, res, next) => {
  const start = Date.now();
  
  // Store the original end method
  const originalEnd = res.end;
  
  // Override the end method to set timing header before response is sent
  res.end = function(...args) {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', duration);
    }
    originalEnd.apply(this, args);
  };
  
  next();
};

// Request ID middleware
export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || 
           `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Default logger based on environment
const logger = process.env.NODE_ENV === 'production' ? productionLogger : developmentLogger;

export default logger;
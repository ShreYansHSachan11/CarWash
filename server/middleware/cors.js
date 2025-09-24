import cors from 'cors';

// Simple CORS configuration that allows all origins for deployment
const corsOptions = {
  origin: true, // Allow all origins temporarily for deployment
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400
};

console.log('CORS: Allowing all origins for deployment debugging');
console.log('CORS: NODE_ENV =', process.env.NODE_ENV);

export default cors(corsOptions);
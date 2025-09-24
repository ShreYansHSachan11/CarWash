# Car Wash Booking System - Deployment Guide

## Overview
This guide covers deploying the Car Wash Booking System to production environments.

## Architecture
- **Frontend**: React application built with Vite
- **Backend**: Node.js/Express API server
- **Database**: MongoDB
- **Environment**: Node.js 18+ required

## Environment Configuration

### Backend Environment Variables
Create `.env.production` in the server directory:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-mongodb-host:27017/carwash-production
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
```

### Frontend Environment Variables
Create `.env.production` in the client directory:
```env
VITE_API_URL=https://your-api-domain.com/api
```

## Deployment Steps

### 1. Backend Deployment

#### Prerequisites
- Node.js 18+ installed
- MongoDB instance running
- PM2 for process management (recommended)

#### Steps
```bash
# Clone repository
git clone <repository-url>
cd server

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env.production
# Edit .env.production with your values

# Start application
npm start

# Or with PM2 (recommended)
npm install -g pm2
pm2 start app.js --name "carwash-api" --env production
```

### 2. Frontend Deployment

#### Build for Production
```bash
cd client
npm install
npm run build
```

#### Deploy to Static Hosting
The `dist/` folder contains the built application. Deploy to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Nginx static hosting

#### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (if serving from same domain)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Database Setup

#### MongoDB Production Setup
```bash
# Create production database
mongosh
use carwash-production

# Create indexes for performance
db.bookings.createIndex({ "customerName": "text", "carDetails.make": "text", "carDetails.model": "text" })
db.bookings.createIndex({ "date": 1 })
db.bookings.createIndex({ "status": 1 })
db.bookings.createIndex({ "createdAt": -1 })
```

#### Seed Initial Data (Optional)
```bash
cd server
npm run seed
```

## Production Optimizations

### Backend Optimizations
- **Logging**: Winston logger configured for production
- **Error Handling**: Comprehensive error handling with proper status codes
- **CORS**: Environment-specific CORS configuration
- **Security**: Input validation and sanitization
- **Performance**: Database indexing and query optimization

### Frontend Optimizations
- **Code Splitting**: Vendor chunks separated for better caching
- **Bundle Analysis**: Optimized chunk sizes
- **Source Maps**: Enabled for production debugging
- **Asset Optimization**: Images and static assets optimized

## Monitoring and Maintenance

### Health Checks
- Backend: `GET /health` endpoint
- Frontend: Build-time checks and error boundaries

### Logging
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Log rotation: Configured for 5MB files, 5 file retention

### Performance Monitoring
```bash
# Check server health
curl https://your-api-domain.com/health

# Monitor logs
tail -f logs/combined.log

# Check PM2 status
pm2 status
pm2 logs carwash-api
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://your-host:27017/carwash-production" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://your-host:27017/carwash-production" /backup/20240101/carwash-production
```

### Application Backup
- Source code: Git repository
- Environment files: Secure backup of .env files
- Logs: Regular log archival

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check CORS_ORIGIN environment variable
2. **Database Connection**: Verify MONGODB_URI and network access
3. **API Errors**: Check logs in `logs/error.log`
4. **Build Failures**: Ensure all dependencies are installed

### Debug Commands
```bash
# Check server status
pm2 status

# View logs
pm2 logs carwash-api

# Restart application
pm2 restart carwash-api

# Check database connection
mongosh $MONGODB_URI
```

## Security Considerations

### Production Security Checklist
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] Error messages don't expose sensitive data
- [ ] Logs don't contain sensitive information
- [ ] Regular security updates applied

### Recommended Security Headers
```javascript
// Add to Express app
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

## Performance Tuning

### Database Performance
- Ensure proper indexing
- Monitor query performance
- Regular database maintenance

### Application Performance
- Use PM2 cluster mode for multiple instances
- Implement caching where appropriate
- Monitor memory usage and optimize

### Frontend Performance
- Enable gzip compression
- Use CDN for static assets
- Implement service worker for caching

## Support and Maintenance

### Regular Maintenance Tasks
- Update dependencies monthly
- Review and rotate logs weekly
- Monitor performance metrics
- Backup database daily
- Security patches as needed

### Contact Information
- Development Team: [team@example.com]
- System Administrator: [admin@example.com]
- Emergency Contact: [emergency@example.com]
import mongoose from 'mongoose';

// Service pricing configuration
const servicePricing = {
  'Basic Wash': { basePrice: 15, duration: 30 },
  'Deluxe Wash': { basePrice: 25, duration: 60 },
  'Full Detailing': { basePrice: 50, duration: 120 }
};

// Add-on pricing configuration
const addOnPricing = {
  'Interior Cleaning': 10,
  'Polishing': 15,
  'Wax Protection': 20,
  'Tire Shine': 5,
  'Air Freshener': 3
};

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Customer name must be at least 2 characters long'],
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  carDetails: {
    make: { 
      type: String, 
      required: [true, 'Car make is required'],
      trim: true
    },
    model: { 
      type: String, 
      required: [true, 'Car model is required'],
      trim: true
    },
    year: { 
      type: Number, 
      required: [true, 'Car year is required'],
      min: [1900, 'Car year must be 1900 or later'],
      max: [new Date().getFullYear() + 1, 'Car year cannot be in the future']
    },
    type: { 
      type: String, 
      required: [true, 'Car type is required'],
      enum: {
        values: ['sedan', 'SUV', 'hatchback', 'luxury', 'truck', 'coupe'],
        message: 'Car type must be one of: sedan, SUV, hatchback, luxury, truck, coupe'
      }
    }
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: {
      values: ['Basic Wash', 'Deluxe Wash', 'Full Detailing'],
      message: 'Service type must be one of: Basic Wash, Deluxe Wash, Full Detailing'
    }
  },
  date: {
    type: Date,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Booking date cannot be in the past'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: {
      values: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
               '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'],
      message: 'Invalid time slot'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [30, 'Duration must be at least 30 minutes'],
    max: [480, 'Duration cannot exceed 8 hours (480 minutes)']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
      message: 'Status must be one of: Pending, Confirmed, In Progress, Completed, Cancelled'
    },
    default: 'Pending'
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: null,
    validate: {
      validator: function(value) {
        // Rating can only be set if status is 'Completed'
        if (value !== null && this.status !== 'Completed') {
          return false;
        }
        return true;
      },
      message: 'Rating can only be set for completed bookings'
    }
  },
  addOns: [{
    type: String,
    enum: {
      values: ['Interior Cleaning', 'Polishing', 'Wax Protection', 'Tire Shine', 'Air Freshener'],
      message: 'Invalid add-on service'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt timestamp
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to update the updatedAt timestamp
bookingSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Instance method to calculate total price including add-ons
bookingSchema.methods.calculateTotalPrice = function() {
  const servicePrice = servicePricing[this.serviceType]?.basePrice || 0;
  const addOnTotal = this.addOns.reduce((total, addOn) => {
    return total + (addOnPricing[addOn] || 0);
  }, 0);
  
  return servicePrice + addOnTotal;
};

// Instance method to get service duration
bookingSchema.methods.getServiceDuration = function() {
  return servicePricing[this.serviceType]?.duration || 0;
};

// Static method to get available time slots
bookingSchema.statics.getAvailableTimeSlots = function() {
  return ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
          '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
};

// Static method to get service pricing
bookingSchema.statics.getServicePricing = function() {
  return servicePricing;
};

// Static method to get add-on pricing
bookingSchema.statics.getAddOnPricing = function() {
  return addOnPricing;
};

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for booking age in days
bookingSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
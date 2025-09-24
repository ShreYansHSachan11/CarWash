// Service pricing and configuration constants
export const SERVICE_TYPES = {
  'Basic Wash': { basePrice: 15, duration: 30 },
  'Deluxe Wash': { basePrice: 25, duration: 60 },
  'Full Detailing': { basePrice: 50, duration: 120 }
};

export const ADD_ON_PRICING = {
  'Interior Cleaning': 10,
  'Polishing': 15,
  'Wax Protection': 20,
  'Tire Shine': 5,
  'Air Freshener': 3
};

export const CAR_TYPES = [
  'sedan',
  'SUV', 
  'hatchback',
  'luxury',
  'truck',
  'coupe'
];

export const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00', 
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00'
];

export const BOOKING_STATUS = [
  'Pending',
  'Confirmed', 
  'In Progress',
  'Completed',
  'Cancelled'
];

// Form validation rules
export const VALIDATION_RULES = {
  customerName: {
    required: 'Customer name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' }
  },
  carMake: {
    required: 'Car make is required'
  },
  carModel: {
    required: 'Car model is required'
  },
  carYear: {
    required: 'Car year is required',
    min: { value: 1900, message: 'Year must be 1900 or later' },
    max: { value: new Date().getFullYear() + 1, message: 'Year cannot be in the future' }
  },
  carType: {
    required: 'Car type is required'
  },
  serviceType: {
    required: 'Service type is required'
  },
  date: {
    required: 'Date is required'
  },
  timeSlot: {
    required: 'Time slot is required'
  }
};
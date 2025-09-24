import Booking from '../models/Booking.js';
import { connectDB, disconnectDB } from './database.js';

const sampleBookings = [
  {
    customerName: 'John Smith',
    carDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      type: 'sedan'
    },
    serviceType: 'Basic Wash',
    date: new Date('2024-12-25'),
    timeSlot: '09:00-10:00',
    duration: 30,
    price: 15,
    status: 'Completed',
    rating: 5,
    addOns: [],
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2024-12-25')
  },
  {
    customerName: 'Sarah Johnson',
    carDetails: {
      make: 'Honda',
      model: 'CR-V',
      year: 2019,
      type: 'SUV'
    },
    serviceType: 'Deluxe Wash',
    date: new Date('2024-12-26'),
    timeSlot: '10:00-11:00',
    duration: 60,
    price: 40,
    status: 'Confirmed',
    rating: null,
    addOns: ['Interior Cleaning', 'Tire Shine'],
    createdAt: new Date('2024-12-21'),
    updatedAt: new Date('2024-12-21')
  },
  {
    customerName: 'Michael Brown',
    carDetails: {
      make: 'BMW',
      model: 'X5',
      year: 2021,
      type: 'luxury'
    },
    serviceType: 'Full Detailing',
    date: new Date('2024-12-27'),
    timeSlot: '14:00-15:00',
    duration: 120,
    price: 85,
    status: 'In Progress',
    rating: null,
    addOns: ['Polishing', 'Wax Protection', 'Air Freshener'],
    createdAt: new Date('2024-12-22'),
    updatedAt: new Date('2024-12-27')
  },
  {
    customerName: 'Emily Davis',
    carDetails: {
      make: 'Volkswagen',
      model: 'Golf',
      year: 2018,
      type: 'hatchback'
    },
    serviceType: 'Basic Wash',
    date: new Date('2024-12-28'),
    timeSlot: '11:00-12:00',
    duration: 30,
    price: 18,
    status: 'Pending',
    rating: null,
    addOns: ['Air Freshener'],
    createdAt: new Date('2024-12-23'),
    updatedAt: new Date('2024-12-23')
  },
  {
    customerName: 'David Wilson',
    carDetails: {
      make: 'Ford',
      model: 'F-150',
      year: 2020,
      type: 'truck'
    },
    serviceType: 'Deluxe Wash',
    date: new Date('2024-12-29'),
    timeSlot: '15:00-16:00',
    duration: 60,
    price: 35,
    status: 'Completed',
    rating: 4,
    addOns: ['Tire Shine'],
    createdAt: new Date('2024-12-24'),
    updatedAt: new Date('2024-12-29')
  },
  {
    customerName: 'Lisa Anderson',
    carDetails: {
      make: 'Audi',
      model: 'A4',
      year: 2022,
      type: 'coupe'
    },
    serviceType: 'Full Detailing',
    date: new Date('2024-12-30'),
    timeSlot: '12:00-13:00',
    duration: 120,
    price: 73,
    status: 'Cancelled',
    rating: null,
    addOns: ['Interior Cleaning', 'Polishing'],
    createdAt: new Date('2024-12-25'),
    updatedAt: new Date('2024-12-29')
  },
  {
    customerName: 'Robert Taylor',
    carDetails: {
      make: 'Chevrolet',
      model: 'Malibu',
      year: 2019,
      type: 'sedan'
    },
    serviceType: 'Deluxe Wash',
    date: new Date('2024-12-31'),
    timeSlot: '13:00-14:00',
    duration: 60,
    price: 45,
    status: 'Confirmed',
    rating: null,
    addOns: ['Interior Cleaning', 'Wax Protection'],
    createdAt: new Date('2024-12-26'),
    updatedAt: new Date('2024-12-26')
  },
  {
    customerName: 'Jennifer Martinez',
    carDetails: {
      make: 'Nissan',
      model: 'Rogue',
      year: 2021,
      type: 'SUV'
    },
    serviceType: 'Basic Wash',
    date: new Date('2025-01-02'),
    timeSlot: '16:00-17:00',
    duration: 30,
    price: 20,
    status: 'Pending',
    rating: null,
    addOns: ['Tire Shine', 'Air Freshener'],
    createdAt: new Date('2024-12-27'),
    updatedAt: new Date('2024-12-27')
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing bookings
    console.log('🗑️  Clearing existing bookings...');
    await Booking.deleteMany({});
    
    // Insert sample bookings
    console.log('📝 Inserting sample bookings...');
    const createdBookings = await Booking.insertMany(sampleBookings);
    
    console.log(`✅ Successfully seeded ${createdBookings.length} bookings:`);
    
    // Display summary of seeded data
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const serviceTypeCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const carTypeCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$carDetails.type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 Seeding Summary:');
    console.log('Status distribution:', statusCounts);
    console.log('Service type distribution:', serviceTypeCounts);
    console.log('Car type distribution:', carTypeCounts);
    
    // Verify data integrity
    const totalBookings = await Booking.countDocuments();
    const completedWithRatings = await Booking.countDocuments({ 
      status: 'Completed', 
      rating: { $ne: null } 
    });
    
    console.log(`\n✅ Data integrity check:`);
    console.log(`Total bookings: ${totalBookings}`);
    console.log(`Completed bookings with ratings: ${completedWithRatings}`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    await connectDB();
    await Booking.deleteMany({});
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// CLI functionality
const runSeedScript = async () => {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
      case 'clear':
        await clearDatabase();
        break;
      case 'reset':
        await clearDatabase();
        await seedDatabase();
        break;
      default:
        console.log('Usage: node seedData.js [seed|clear|reset]');
        console.log('  seed  - Add sample data to database');
        console.log('  clear - Remove all bookings from database');
        console.log('  reset - Clear database and add sample data');
    }
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

// Export functions for use in other modules
export { seedDatabase, clearDatabase, sampleBookings };

// Run script if called directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  runSeedScript();
}
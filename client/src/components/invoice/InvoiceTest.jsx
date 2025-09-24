import React from 'react';
import { InvoiceTemplate, InvoiceButton } from './index';

// Test component to verify invoice functionality
const InvoiceTest = () => {
  const mockBooking = {
    _id: '507f1f77bcf86cd799439011',
    customerName: 'John Doe',
    serviceType: 'Deluxe Wash',
    duration: 45,
    date: new Date('2024-01-15'),
    timeSlot: '10:00 AM - 10:45 AM',
    status: 'Completed',
    price: 35.00,
    carDetails: {
      year: 2020,
      make: 'Toyota',
      model: 'Camry',
      type: 'sedan'
    },
    addOns: ['Interior Cleaning', 'Wax Protection'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Invoice Test</h1>
      
      <div className="mb-6 flex space-x-4">
        <InvoiceButton booking={mockBooking} variant="download" />
        <InvoiceButton booking={mockBooking} variant="print" />
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Invoice Preview:</h2>
        <InvoiceTemplate 
          booking={mockBooking}
          invoiceNumber="INV-2024-001"
          invoiceDate={new Date()}
        />
      </div>
    </div>
  );
};

export default InvoiceTest;
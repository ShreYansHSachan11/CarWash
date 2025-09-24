import React from 'react';
import { Calendar, Clock, Car, User, DollarSign, MapPin } from 'lucide-react';
import '../../styles/invoice.css';

const InvoiceTemplate = ({ booking, invoiceNumber, invoiceDate }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const getServicePrice = (serviceType) => {
    const servicePricing = {
      'Basic Wash': 15,
      'Deluxe Wash': 25,
      'Full Detailing': 50
    };
    return servicePricing[serviceType] || 0;
  };

  const getAddOnPrice = (addon) => {
    const addOnPricing = {
      'Interior Cleaning': 10,
      'Polishing': 15,
      'Wax Protection': 20,
      'Tire Shine': 5,
      'Air Freshener': 3
    };
    return addOnPricing[addon] || 0;
  };

  const basePrice = getServicePrice(booking.serviceType);
  const addOnsTotal = booking.addOns?.reduce((total, addon) => total + getAddOnPrice(addon), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 invoice-template" id="invoice-template">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">CarWash Pro</h1>
            <p className="text-gray-600">Professional Car Washing Services</p>
            <div className="mt-4 text-sm text-gray-600">
              <p>123 Main Street</p>
              <p>City, State 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: info@carwashpro.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Invoice #:</span> {invoiceNumber}</p>
              <p><span className="font-medium">Date:</span> {new Date(invoiceDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Booking ID:</span> {booking._id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">{booking.customerName}</p>
            <p className="text-gray-600 mt-1">Customer</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{booking.timeSlot}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                booking.status === 'Completed' ? 'text-green-600' : 
                booking.status === 'Confirmed' ? 'text-blue-600' : 
                booking.status === 'In Progress' ? 'text-purple-600' :
                booking.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {booking.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information:</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Car className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-gray-900">
              {booking.carDetails.year} {booking.carDetails.make} {booking.carDetails.model}
            </span>
          </div>
          <p className="text-gray-600 capitalize ml-7">Type: {booking.carDetails.type}</p>
        </div>
      </div>

      {/* Services Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services:</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200">
                  Service
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b border-gray-200">
                  Duration
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 border-b border-gray-200">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {booking.serviceType}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 text-center">
                  {booking.duration} minutes
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                  {formatPrice(basePrice)}
                </td>
              </tr>
              {booking.addOns && booking.addOns.map((addon, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {addon} (Add-on)
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    -
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                    {formatPrice(getAddOnPrice(addon))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-full max-w-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">{formatPrice(basePrice + addOnsTotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tax (0%):</span>
              <span className="text-sm font-medium">$0.00</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-blue-600">{formatPrice(booking.price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">Thank you for choosing CarWash Pro!</p>
          <p>For questions about this invoice, please contact us at (555) 123-4567 or info@carwashpro.com</p>
        </div>
      </div>

      {/* Print-only styles */}
      <style jsx>{`
        @media print {
          body { margin: 0; }
          #invoice-template { 
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .print\\:p-6 { padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceTemplate;
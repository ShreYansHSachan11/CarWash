import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { 
  SERVICE_TYPES, 
  ADD_ON_PRICING, 
  CAR_TYPES, 
  TIME_SLOTS, 
  BOOKING_STATUS,
  VALIDATION_RULES 
} from '../../utils/constants';

const BookingForm = ({ 
  initialData = null, 
  onSubmit, 
  loading = false,
  submitButtonText = 'Create Booking',
  showStatusField = false
}) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: initialData || {
      customerName: '',
      carDetails: {
        make: '',
        model: '',
        year: '',
        type: ''
      },
      serviceType: '',
      date: '',
      timeSlot: '',
      addOns: [],
      status: 'Pending'
    }
  });

  // Watch form values for price calculation
  const watchedServiceType = watch('serviceType');
  const watchedAddOns = watch('addOns') || [];

  // Calculate total price when service type or add-ons change
  useEffect(() => {
    calculateTotalPrice();
  }, [watchedServiceType, selectedAddOns]);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSelectedAddOns(initialData.addOns || []);
    }
  }, [initialData, reset]);

  const calculateTotalPrice = () => {
    let basePrice = 0;
    
    if (watchedServiceType && SERVICE_TYPES[watchedServiceType]) {
      basePrice = SERVICE_TYPES[watchedServiceType].basePrice;
    }

    const addOnsPrice = selectedAddOns.reduce((total, addOn) => {
      return total + (ADD_ON_PRICING[addOn] || 0);
    }, 0);

    const total = basePrice + addOnsPrice;
    setTotalPrice(total);
  };

  const handleAddOnChange = (addOn, checked) => {
    let newAddOns;
    if (checked) {
      newAddOns = [...selectedAddOns, addOn];
    } else {
      newAddOns = selectedAddOns.filter(item => item !== addOn);
    }
    
    setSelectedAddOns(newAddOns);
    setValue('addOns', newAddOns);
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      price: totalPrice,
      duration: SERVICE_TYPES[data.serviceType]?.duration || 30,
      addOns: selectedAddOns
    };
    onSubmit(formData);
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="space-y-4 sm:space-y-6"
      noValidate
      aria-label="Booking form"
    >
      {/* Customer Information */}
      <fieldset className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <legend className="text-lg font-semibold text-gray-900 mb-4">Customer Information</legend>
        
        <Input
          label="Customer Name"
          {...register('customerName', VALIDATION_RULES.customerName)}
          error={errors.customerName?.message}
          placeholder="Enter customer name"
          required
          aria-describedby={errors.customerName ? 'customerName-error' : undefined}
        />
      </fieldset>

      {/* Car Details */}
      <fieldset className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <legend className="text-lg font-semibold text-gray-900 mb-4">Car Details</legend>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Make"
            {...register('carDetails.make', VALIDATION_RULES.carMake)}
            error={errors.carDetails?.make?.message}
            placeholder="e.g., Toyota, Honda"
            required
          />
          
          <Input
            label="Model"
            {...register('carDetails.model', VALIDATION_RULES.carModel)}
            error={errors.carDetails?.model?.message}
            placeholder="e.g., Camry, Civic"
            required
          />
          
          <Input
            label="Year"
            type="number"
            {...register('carDetails.year', {
              ...VALIDATION_RULES.carYear,
              valueAsNumber: true
            })}
            error={errors.carDetails?.year?.message}
            placeholder="e.g., 2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Car Type <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="carDetails.type"
              control={control}
              rules={VALIDATION_RULES.carType}
              render={({ field }) => (
                <select
                  {...field}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.carDetails?.type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select car type</option>
                  {CAR_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.carDetails?.type && (
              <p className="text-sm text-red-600" id="carType-error">{errors.carDetails.type.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Service Selection */}
      <fieldset className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <legend className="text-lg font-semibold text-gray-900 mb-4">Service Selection</legend>
        
        <div className="space-y-1 mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Service Type <span className="text-red-500 ml-1">*</span>
          </label>
          <Controller
            name="serviceType"
            control={control}
            rules={VALIDATION_RULES.serviceType}
            render={({ field }) => (
              <div className="space-y-2">
                {Object.entries(SERVICE_TYPES).map(([service, details]) => (
                  <label key={service} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      {...field}
                      value={service}
                      checked={field.value === service}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 flex-shrink-0"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{service}</span>
                        <span className="text-blue-600 font-semibold text-sm sm:text-base">${details.basePrice}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{details.duration} minutes</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.serviceType && (
            <p className="text-sm text-red-600" id="serviceType-error">{errors.serviceType.message}</p>
          )}
        </div>
      </fieldset>

      {/* Add-ons Selection */}
      <fieldset className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <legend className="text-lg font-semibold text-gray-900 mb-4">Add-ons (Optional)</legend>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(ADD_ON_PRICING).map(([addOn, price]) => (
            <label key={addOn} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={selectedAddOns.includes(addOn)}
                onChange={(e) => handleAddOnChange(addOn, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
              />
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-medium text-gray-900 text-sm sm:text-base">{addOn}</span>
                  <span className="text-blue-600 font-semibold text-sm sm:text-base">+${price}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Date and Time */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            {...register('date', VALIDATION_RULES.date)}
            error={errors.date?.message}
            min={getMinDate()}
            required
          />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Time Slot <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="timeSlot"
              control={control}
              rules={VALIDATION_RULES.timeSlot}
              render={({ field }) => (
                <select
                  {...field}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.timeSlot ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select time slot</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              )}
            />
            {errors.timeSlot && (
              <p className="text-sm text-red-600">{errors.timeSlot.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Field (only for editing) */}
      {showStatusField && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.status ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select status</option>
                  {BOOKING_STATUS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              )}
            />
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
        
        <div className="space-y-2">
          {watchedServiceType && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">{watchedServiceType}</span>
              <span className="font-medium text-sm sm:text-base">${SERVICE_TYPES[watchedServiceType]?.basePrice || 0}</span>
            </div>
          )}
          
          {selectedAddOns.map(addOn => (
            <div key={addOn} className="flex justify-between items-center">
              <span className="text-gray-600 text-sm sm:text-base">{addOn}</span>
              <span className="font-medium text-sm sm:text-base">+${ADD_ON_PRICING[addOn]}</span>
            </div>
          ))}
          
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">${totalPrice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
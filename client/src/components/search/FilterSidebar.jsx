import { useState } from 'react';
import { ChevronDown, ChevronUp, X, Calendar } from 'lucide-react';
import { SERVICE_TYPES, CAR_TYPES, BOOKING_STATUS } from '../../utils/constants';

const FilterSidebar = ({ 
  filters = {}, 
  onFiltersChange, 
  onClearFilters,
  onApplyFilters,
  isOpen = false,
  onToggle,
  className = "",
  isApplying = false
}) => {
  const [expandedSections, setExpandedSections] = useState({
    serviceType: true,
    carType: true,
    status: true,
    dateRange: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value, checked) => {
    const currentValues = filters[filterType] || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    onFiltersChange({
      ...filters,
      [filterType]: newValues
    });
  };

  const handleDateChange = (dateType, value) => {
    onFiltersChange({
      ...filters,
      [dateType]: value
    });
  };

  const clearAllFilters = () => {
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        count += value.length;
      } else if (value && !Array.isArray(value)) {
        count += 1;
      }
    });
    return count;
  };

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-gray-700"
      >
        <span>{title}</span>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="mt-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxFilter = ({ value, label, filterType, count }) => (
    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
      <input
        type="checkbox"
        checked={(filters[filterType] || []).includes(value)}
        onChange={(e) => handleFilterChange(filterType, value, e.target.checked)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </label>
  );

  if (!isOpen) return null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 max-h-80 sm:max-h-96 overflow-y-auto">
        {/* Service Type Filter */}
        <FilterSection title="Service Type" sectionKey="serviceType">
          {Object.keys(SERVICE_TYPES).map(serviceType => (
            <CheckboxFilter
              key={serviceType}
              value={serviceType}
              label={serviceType}
              filterType="serviceType"
            />
          ))}
        </FilterSection>

        {/* Car Type Filter */}
        <FilterSection title="Car Type" sectionKey="carType">
          {CAR_TYPES.map(carType => (
            <CheckboxFilter
              key={carType}
              value={carType}
              label={carType.charAt(0).toUpperCase() + carType.slice(1)}
              filterType="carType"
            />
          ))}
        </FilterSection>

        {/* Status Filter */}
        <FilterSection title="Status" sectionKey="status">
          {BOOKING_STATUS.map(status => (
            <CheckboxFilter
              key={status}
              value={status}
              label={status}
              filterType="status"
            />
          ))}
        </FilterSection>

        {/* Date Range Filter */}
        <FilterSection title="Date Range" sectionKey="dateRange">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateChange('dateTo', e.target.value)}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection title="Price Range" sectionKey="priceRange">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={filters.minPrice || ''}
                onChange={(e) => handleDateChange('minPrice', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={filters.maxPrice || ''}
                onChange={(e) => handleDateChange('maxPrice', e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <button
            onClick={clearAllFilters}
            disabled={isApplying}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Filters
          </button>
          <button
            onClick={onApplyFilters || onToggle}
            disabled={isApplying}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Applying...
              </>
            ) : (
              'Apply Filters'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
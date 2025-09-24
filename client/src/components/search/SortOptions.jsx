import { useState } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';

const SortOptions = ({ 
  sortBy = 'newest', 
  sortOrder = 'desc', 
  onSortChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Newest First', field: 'createdAt', order: 'desc' },
    { value: 'oldest', label: 'Oldest First', field: 'createdAt', order: 'asc' },
    { value: 'price-high', label: 'Price: High to Low', field: 'price', order: 'desc' },
    { value: 'price-low', label: 'Price: Low to High', field: 'price', order: 'asc' },
    { value: 'duration-long', label: 'Duration: Longest First', field: 'duration', order: 'desc' },
    { value: 'duration-short', label: 'Duration: Shortest First', field: 'duration', order: 'asc' },
    { value: 'status-az', label: 'Status: A to Z', field: 'status', order: 'asc' },
    { value: 'status-za', label: 'Status: Z to A', field: 'status', order: 'desc' },
    { value: 'date-newest', label: 'Booking Date: Newest', field: 'date', order: 'desc' },
    { value: 'date-oldest', label: 'Booking Date: Oldest', field: 'date', order: 'asc' }
  ];

  const getCurrentSortLabel = () => {
    const currentSort = sortOptions.find(option => 
      option.field === sortBy && option.order === sortOrder
    );
    return currentSort ? currentSort.label : 'Newest First';
  };

  const handleSortSelect = (option) => {
    onSortChange(option.field, option.order);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Sort Button */}
      <button
        onClick={toggleDropdown}
        className={`w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
        <span className="text-sm font-medium truncate">
          <span className="hidden sm:inline">Sort: </span>
          {getCurrentSortLabel()}
        </span>
        <ChevronDown className={`h-4 w-4 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Sort Options
              </div>
              
              {sortOptions.map((option) => {
                const isSelected = option.field === sortBy && option.order === sortOrder;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {isSelected && (
                        <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SortOptions;
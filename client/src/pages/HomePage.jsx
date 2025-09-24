import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { SearchBar, FilterSidebar, SortOptions } from '../components/search';
import BookingList from '../components/booking/BookingList';
import { useFilters } from '../hooks/useFilters';
import { useSort } from '../hooks/useSort';

const HomePage = () => {
  const { 
    filters, 
    updateFilters, 
    clearFilters, 
    hasActiveFilters 
  } = useFilters();
  
  const { sortBy, sortOrder, updateSort } = useSort();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFiltersChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setIsFilterSidebarOpen(false);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    updateSort(newSortBy, newSortOrder);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
    setIsFilterSidebarOpen(false);
  };

  const toggleFilterSidebar = () => {
    setIsFilterSidebarOpen(!isFilterSidebarOpen);
  };

  // Convert filters to the format expected by BookingList
  const formatFiltersForAPI = () => {
    const apiFilters = {};
    
    if (filters.serviceType.length > 0) {
      apiFilters.serviceType = filters.serviceType.join(',');
    }
    if (filters.carType.length > 0) {
      apiFilters.carType = filters.carType.join(',');
    }
    if (filters.status.length > 0) {
      apiFilters.status = filters.status.join(',');
    }
    if (filters.dateFrom) {
      apiFilters.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      apiFilters.dateTo = filters.dateTo;
    }
    if (filters.minPrice) {
      apiFilters.minPrice = filters.minPrice;
    }
    if (filters.maxPrice) {
      apiFilters.maxPrice = filters.maxPrice;
    }
    
    return apiFilters;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Car Wash Bookings</h1>
          <p className="mt-2 text-gray-600">Manage and view all your car wash appointments</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/add-booking"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Create a new booking"
          >
            <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
            New Booking
          </Link>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8" aria-label="Search and filter controls">
        <div className="flex flex-col space-y-4">
          {/* Top Row - Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by customer name or car details..."
              className="flex-1 sm:max-w-md"
            />

            {/* Filter and Sort Controls */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              {/* Filter Button */}
              <div className="relative">
                <button 
                  onClick={toggleFilterSidebar}
                  className={`w-full xs:w-auto inline-flex items-center justify-center px-4 py-2 border rounded-lg transition-colors text-sm font-medium ${
                    hasActiveFilters() 
                      ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters() && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {Object.values(filters).flat().filter(Boolean).length}
                    </span>
                  )}
                </button>
                
                {/* Filter Sidebar */}
                {isFilterSidebarOpen && (
                  <>
                    {/* Mobile backdrop */}
                    <div 
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
                      onClick={toggleFilterSidebar}
                    />
                    {/* Filter sidebar - responsive positioning */}
                    <div className="absolute z-50 mt-2 right-0 w-80 sm:w-80 max-w-[calc(100vw-2rem)] sm:max-w-none">
                      <FilterSidebar
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        onClearFilters={handleClearFilters}
                        onApplyFilters={handleApplyFilters}
                        isOpen={isFilterSidebarOpen}
                        onToggle={toggleFilterSidebar}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Sort Options */}
              <div className="w-full xs:w-auto">
                <SortOptions
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  className="w-full xs:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking List */}
      <BookingList
        searchTerm={searchTerm}
        filters={formatFiltersForAPI()}
        sortBy={sortBy}
        sortOrder={sortOrder}
        itemsPerPage={8}
      />
    </div>
  );
};

export default HomePage;
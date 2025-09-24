import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from 'lodash';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search by customer name or car details...",
  className = "",
  initialValue = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce(async (term) => {
      setIsSearching(true);
      try {
        await onSearch(term);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [onSearch]
  );

  // Effect to trigger search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
    
    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" aria-hidden="true" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors focus:outline-none"
          aria-label="Search bookings by customer name or car details"
          aria-describedby={searchTerm ? "search-status" : undefined}
          role="searchbox"
        />
        
        {/* Clear button - only show when there's text */}
        {searchTerm && !isSearching && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Clear search"
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2" aria-hidden="true">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>
      
      {/* Search results count or status */}
      {searchTerm && !isSearching && (
        <div 
          id="search-status"
          className="absolute top-full left-0 right-0 mt-1 text-sm text-gray-500"
          aria-live="polite"
          role="status"
        >
          Searching for "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default SearchBar;
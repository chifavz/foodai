import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

function SearchAndFilters({ 
  searchTerm, 
  onSearchChange, 
  mealPreferences,
  onFilterByCuisine,
  onClearFilters,
  quickFilters = ['All', 'Italian', 'French', 'Japanese', 'Vegetarian'],
  debounceMs = 300
}) {
  const inputRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Debounced search effect
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      // Only trigger onSearchChange for debounced API calls if needed
      // For now, we'll keep the immediate UI updates and rely on the parent
      // to handle debouncing for API calls if they choose to use debouncedSearchTerm
    }
  }, [debouncedSearchTerm, searchTerm]);

  // Memoized filter buttons to prevent unnecessary re-renders
  const filterButtons = useMemo(() => {
    return quickFilters.map(cuisine => {
      const isActive = (cuisine === 'All' && !mealPreferences.cuisine) || 
                       mealPreferences.cuisine === cuisine;
      
      return (
        <button
          key={cuisine}
          onClick={() => cuisine === 'All' ? onClearFilters() : onFilterByCuisine(cuisine)}
          className={`px-3 py-1 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
            isActive
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label={`Filter by ${cuisine} cuisine`}
          aria-pressed={isActive}
        >
          {cuisine === 'All' ? '🍽️ All' : 
           cuisine === 'Italian' ? '🍝 Italian' :
           cuisine === 'French' ? '🥖 French' :
           cuisine === 'Japanese' ? '🍣 Japanese' :
           cuisine === 'Vegetarian' ? '🥗 Vegetarian' :
           `🥗 ${cuisine}`}
        </button>
      );
    });
  }, [quickFilters, mealPreferences.cuisine, onFilterByCuisine, onClearFilters]);

  const handleClearSearch = useCallback(() => {
    onSearchChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onSearchChange]);

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search within matched meals..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          aria-label="Search meals by name, description, or cuisine"
        />
        <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 pointer-events-none">
          🔍
        </div>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Quick Cuisine Filter Buttons */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Quick Filters:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterButtons}
        </div>
      </div>
    </div>
  );
}

export default SearchAndFilters;
import React from 'react';

function SearchAndFilters({ 
  searchTerm, 
  onSearchChange, 
  mealPreferences,
  onFilterByCuisine,
  onClearFilters 
}) {
  const quickFilters = ['All', 'Italian', 'French', 'Japanese', 'Vegetarian'];

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search within matched meals..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          aria-label="Search meals by name, description, or cuisine"
        />
        <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500">
          🔍
        </div>
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
          {quickFilters.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => cuisine === 'All' ? onClearFilters() : onFilterByCuisine(cuisine)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (cuisine === 'All' && !mealPreferences.cuisine) || mealPreferences.cuisine === cuisine
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label={`Filter by ${cuisine} cuisine`}
              aria-pressed={
                (cuisine === 'All' && !mealPreferences.cuisine) || 
                mealPreferences.cuisine === cuisine
              }
            >
              {cuisine === 'All' ? '🍽️ All' : 
               cuisine === 'Italian' ? '🍝 Italian' :
               cuisine === 'French' ? '🥖 French' :
               cuisine === 'Japanese' ? '🍣 Japanese' :
               '🥗 Vegetarian'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchAndFilters;
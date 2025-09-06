import React, { useState } from 'react';

function MealPreferencesFilter({ onPreferencesChange, currentPreferences = {} }) {
  const [preferences, setPreferences] = useState({
    cuisine: currentPreferences.cuisine || '',
    diet: currentPreferences.diet || '',
    maxPrice: currentPreferences.maxPrice || '',
    category: currentPreferences.category || 'All',
    allergens: currentPreferences.allergens || []
  });

  const cuisineOptions = ['Italian', 'French', 'Japanese', 'Vegetarian', 'American', 'Chinese', 'Thai', 'Indian'];
  const dietOptions = ['regular', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'gluten-free'];
  const categoryOptions = ['All', 'Appetizer', 'Main Course', 'Dessert'];
  const allergenOptions = ['dairy', 'gluten', 'nuts', 'eggs', 'fish', 'shellfish', 'soy', 'sesame'];

  const handleChange = (field, value) => {
    const newPreferences = { ...preferences, [field]: value };
    setPreferences(newPreferences);
    onPreferencesChange(newPreferences);
  };

  const handleAllergenToggle = (allergen) => {
    const currentAllergens = preferences.allergens || [];
    const newAllergens = currentAllergens.includes(allergen)
      ? currentAllergens.filter(a => a !== allergen)
      : [...currentAllergens, allergen];
    
    const newPreferences = { ...preferences, allergens: newAllergens };
    setPreferences(newPreferences);
    onPreferencesChange(newPreferences);
  };

  const clearAllFilters = () => {
    const clearedPreferences = {
      cuisine: '',
      diet: '',
      maxPrice: '',
      category: 'All',
      allergens: []
    };
    setPreferences(clearedPreferences);
    onPreferencesChange(clearedPreferences);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🎯 AI Meal Matching Preferences
        </h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cuisine Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cuisine Type
          </label>
          <select
            value={preferences.cuisine}
            onChange={(e) => handleChange('cuisine', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Any Cuisine</option>
            {cuisineOptions.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>

        {/* Diet Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dietary Preference
          </label>
          <select
            value={preferences.diet}
            onChange={(e) => handleChange('diet', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Any Diet</option>
            {dietOptions.map(diet => (
              <option key={diet} value={diet}>{diet.charAt(0).toUpperCase() + diet.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Price ($)
          </label>
          <input
            type="number"
            value={preferences.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            placeholder="No limit"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meal Category
          </label>
          <select
            value={preferences.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categoryOptions.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Allergen Exclusions */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exclude Allergens
        </label>
        <div className="flex flex-wrap gap-2">
          {allergenOptions.map(allergen => (
            <button
              key={allergen}
              onClick={() => handleAllergenToggle(allergen)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                preferences.allergens.includes(allergen)
                  ? 'bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              {allergen}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {Object.values(preferences).some(val => val && (Array.isArray(val) ? val.length > 0 : val !== 'All')) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Active filters:</strong> {' '}
            {preferences.cuisine && `${preferences.cuisine} cuisine`}
            {preferences.diet && `, ${preferences.diet} diet`}
            {preferences.maxPrice && `, under $${preferences.maxPrice}`}
            {preferences.category && preferences.category !== 'All' && `, ${preferences.category}`}
            {preferences.allergens.length > 0 && `, excluding ${preferences.allergens.join(', ')}`}
          </p>
        </div>
      )}
    </div>
  );
}

export default MealPreferencesFilter;
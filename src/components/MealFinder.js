import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import DarkModeToggle from './DarkModeToggle';
import apiService from '../services/api';

function MealFinder() {
  const navigate = useNavigate();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  const [preferences, setPreferences] = useState({
    cuisine: '',
    diet: '',
    maxPrice: '',
    category: ''
  });
  const [meals, setMeals] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState('');

  const cuisineOptions = [
    { value: '', label: 'Any Cuisine' },
    { value: 'italian', label: 'Italian' },
    { value: 'french', label: 'French' },
    { value: 'american', label: 'American' },
    { value: 'asian', label: 'Asian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'pizza', label: 'Pizza' }
  ];

  const dietOptions = [
    { value: '', label: 'Any Diet' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten-Free' }
  ];

  const categoryOptions = [
    { value: '', label: 'Any Category' },
    { value: 'appetizer', label: 'Appetizer' },
    { value: 'main course', label: 'Main Course' },
    { value: 'dessert', label: 'Dessert' }
  ];

  const priceOptions = [
    { value: '', label: 'Any Price' },
    { value: '15', label: 'Under $15' },
    { value: '25', label: 'Under $25' },
    { value: '35', label: 'Under $35' },
    { value: '50', label: 'Under $50' }
  ];

  // Load user profile to prefill preferences
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await apiService.getUserProfile();
        if (profile) {
          setPreferences(prev => ({
            ...prev,
            cuisine: profile.cuisinePreferences?.[0]?.toLowerCase() || '',
            diet: profile.dietaryRestrictions?.[0]?.toLowerCase() || '',
            maxPrice: profile.budgetRange?.includes('$') ? 
              profile.budgetRange.replace(/[^0-9]/g, '') : ''
          }));
        }
      } catch (error) {
        console.log('No user profile found, using default preferences');
      }
    };
    loadUserProfile();
  }, []);

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    startLoading();

    try {
      const result = await apiService.getMeals(preferences);
      setMeals(result.meals);
      
      // Generate AI recommendation
      const aiResponse = await generateAiRecommendation(result.meals, preferences);
      setAiRecommendation(aiResponse);
      
      stopLoading();
    } catch (error) {
      console.error('Error searching meals:', error);
      setLoadingError('Failed to search meals. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const generateAiRecommendation = async (foundMeals, prefs) => {
    try {
      const profile = await apiService.getUserProfile();
      
      if (foundMeals.length === 0) {
        return "I couldn't find any meals matching your exact criteria. Try adjusting your preferences or let me know what you're in the mood for!";
      }

      const topMeal = foundMeals[0];
      const filterDescription = [];
      
      if (prefs.cuisine) filterDescription.push(`${prefs.cuisine} cuisine`);
      if (prefs.diet) filterDescription.push(`${prefs.diet} options`);
      if (prefs.maxPrice) filterDescription.push(`under $${prefs.maxPrice}`);
      if (prefs.category) filterDescription.push(`${prefs.category.toLowerCase()}s`);

      const filtersText = filterDescription.length > 0 ? 
        ` looking for ${filterDescription.join(', ')}` : '';

      const personalTouch = profile?.name ? `, ${profile.name}` : '';
      
      return `Great choice${personalTouch}! I found ${foundMeals.length} perfect meal${foundMeals.length > 1 ? 's' : ''}${filtersText}. I especially recommend the "${topMeal.name}" by ${topMeal.chef} - it has a ${topMeal.rating} star rating and ${topMeal.description.toLowerCase()}. ${foundMeals.length > 1 ? `You have ${foundMeals.length - 1} other excellent option${foundMeals.length > 2 ? 's' : ''} to explore too!` : ''}`;
    } catch (error) {
      return "I found some great options for you! Check out the results below.";
    }
  };

  const addToCart = async (meal) => {
    try {
      const currentCart = await apiService.getCart();
      const existingItem = currentCart.find(item => item.id === meal.id);
      
      let updatedCart;
      if (existingItem) {
        updatedCart = currentCart.map(item =>
          item.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...currentCart, { ...meal, quantity: 1 }];
      }
      
      await apiService.saveCart(updatedCart);
      alert(`${meal.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-orange-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent hover:from-orange-700 hover:to-red-700 transition-colors"
              >
                🍽️ FoodAI
              </button>
              <span className="text-orange-600 dark:text-orange-400 font-medium">Meal Finder</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/ai-waitress')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>🤖</span>
                <span>AI Waitress</span>
              </button>
              <button
                onClick={() => navigate('/customer')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Menu
              </button>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Find Your Perfect Meal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Tell us your preferences and let Sofia, our AI assistant, help you discover amazing dishes 
            tailored just for you from our curated selection of restaurants.
          </p>
        </div>

        {/* Preference Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            What are you in the mood for?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cuisine Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cuisine Type
              </label>
              <select
                value={preferences.cuisine}
                onChange={(e) => handlePreferenceChange('cuisine', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {cuisineOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dietary Preference
              </label>
              <select
                value={preferences.diet}
                onChange={(e) => handlePreferenceChange('diet', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {dietOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Range
              </label>
              <select
                value={preferences.maxPrice}
                onChange={(e) => handlePreferenceChange('maxPrice', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {priceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meal Type
              </label>
              <select
                value={preferences.category}
                onChange={(e) => handlePreferenceChange('category', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isSearching ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Finding Perfect Meals...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>🔍</span>
                  <span>Find My Meals</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* AI Recommendation */}
        {aiRecommendation && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Sofia's Recommendation
                </h3>
                <p className="text-purple-800 dark:text-purple-200">
                  {aiRecommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              {meals.length > 0 ? `Found ${meals.length} Perfect Match${meals.length > 1 ? 'es' : ''}` : 'No Meals Found'}
            </h2>

            {meals.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No meals found matching your criteria. Try adjusting your preferences!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map((meal) => (
                  <div key={meal.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{meal.image}</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          ${meal.price}
                        </div>
                        <div className="flex items-center text-yellow-500">
                          <span>⭐</span>
                          <span className="ml-1 text-sm">{meal.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {meal.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {meal.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{meal.chef}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {meal.category}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => addToCart(meal)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add to Cart - ${meal.price}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MealFinder;
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import DarkModeToggle from './DarkModeToggle';
import LoadingSpinner from './LoadingSpinner';
import ActionCard from './ActionCard';
import apiService from '../services/api';

function RestaurantDiscovery() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  
  const [restaurants, setRestaurants] = useState([]);
  const [searchLocation, setSearchLocation] = useState('downtown');
  const [searchTerm, setSearchTerm] = useState('restaurants');
  const [isLoading, setIsLoading] = useState(false);

  const searchRestaurants = async (loc = searchLocation, term = searchTerm) => {
    setIsLoading(true);
    startLoading();
    
    try {
      const results = await apiService.searchRestaurants(loc, term, 10);
      setRestaurants(results || []);
      stopLoading();
    } catch (error) {
      setLoadingError('Failed to search restaurants');
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial restaurants or use data from navigation state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const locationParam = params.get('location') || 'downtown';
    const termParam = params.get('term') || 'restaurants';
    
    setSearchLocation(locationParam);
    setSearchTerm(termParam);
    
    if (location.state?.restaurants) {
      setRestaurants(location.state.restaurants);
    } else {
      searchRestaurants(locationParam, termParam);
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRestaurantSelect = async (restaurant) => {
    setIsLoading(true);
    
    try {
      // Try to get the restaurant's menu
      const menu = await apiService.getRestaurantMenu(restaurant.id);
      
      // If menu is available, navigate to menu view with restaurant context
      if (menu && menu.categories && menu.categories.length > 0) {
        navigate('/customer', { 
          state: { 
            restaurant: restaurant,
            menu: menu,
            fromDiscovery: true
          }
        });
      } else {
        // If no menu available, still navigate but with restaurant info
        navigate('/customer', { 
          state: { 
            restaurant: restaurant,
            fromDiscovery: true,
            noMenuAvailable: true
          }
        });
      }
    } catch (error) {
      console.error('Error loading restaurant menu:', error);
      // Navigate anyway with just restaurant info
      navigate('/customer', { 
        state: { 
          restaurant: restaurant,
          fromDiscovery: true,
          menuError: true
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchRestaurants();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🔍 Discover Restaurants
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <button
                onClick={() => navigate('/ai-waitress')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                💬 Ask Sofia
              </button>
              <button
                onClick={() => navigate('/customer')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🛒 View Menu
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Enter location (e.g., downtown, Seattle, 10001)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cuisine Type
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter cuisine or restaurant type"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {isLoading && restaurants.length === 0 && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Finding amazing restaurants for you...</p>
          </div>
        )}

        {restaurants.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Found {restaurants.length} restaurants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <ActionCard
                  key={restaurant.id}
                  type="restaurant"
                  data={{
                    ...restaurant,
                    address: restaurant.location?.address1 && restaurant.location?.city 
                      ? `${restaurant.location.address1}, ${restaurant.location.city}`
                      : restaurant.location?.address1 || restaurant.location?.city || 'Address not available',
                    phone: restaurant.phone,
                    description: restaurant.categories?.join(' • ') || 'Restaurant'
                  }}
                  onRestaurantSelect={handleRestaurantSelect}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                />
              ))}
            </div>
          </div>
        )}

        {!isLoading && restaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search location or cuisine type
            </p>
            <button
              onClick={() => navigate('/customer')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Our Menu Instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantDiscovery;
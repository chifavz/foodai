import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import DarkModeToggle from './DarkModeToggle';
import MealPreferencesFilter from './MealPreferencesFilter';
import CartSummary from './CartSummary';
import MenuList from './MenuList';
import ItemDetailsModal from './ItemDetailsModal';
import SearchAndFilters from './SearchAndFilters';
import RestaurantReviews from './RestaurantReviews';
import useCart from '../hooks/useCart';
import apiService from '../services/api';

function CustomerInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  
  // Use the custom cart hook
  const { 
    cart, 
    loading: cartLoading, 
    error: cartError,
    addToCart, 
    updateQuantity, 
    getTotalPrice,
    totalItems 
  } = useCart();
  
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  const [mealPreferences, setMealPreferences] = useState({});
  const [showPreferences, setShowPreferences] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [fromDiscovery, setFromDiscovery] = useState(false);


  // Load meals based on preferences
  const loadMealsWithPreferences = async (preferences = {}) => {
    setIsLoadingMenu(true);
    try {
      const meals = await apiService.getMealsFiltered(preferences);
      setMenuItems(meals);
    } catch (error) {
      console.error('Failed to load meals:', error);
      setLoadingError('Failed to load meals');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  // Load initial data on component mount
  useEffect(() => {
    const loadData = async () => {
      startLoading();
      
      // Check if we're coming from restaurant discovery
      const restaurantData = location.state?.restaurant;
      const discoveryMenu = location.state?.menu;
      const isFromDiscovery = location.state?.fromDiscovery;
      
      setFromDiscovery(isFromDiscovery || false);
      setCurrentRestaurant(restaurantData || null);
      
      try {
        let items = [];
        
        // If we have restaurant-specific menu data, use it
        if (discoveryMenu && discoveryMenu.categories) {
          items = apiService.menuApiService.getAllMenuItems(discoveryMenu);
        } else if (restaurantData && !location.state?.noMenuAvailable) {
          // Try to load menu for the specific restaurant
          try {
            const restaurantMenu = await apiService.getRestaurantMenu(restaurantData.id);
            if (restaurantMenu && restaurantMenu.categories) {
              items = apiService.menuApiService.getAllMenuItems(restaurantMenu);
            } else {
              // Fall back to default menu if restaurant menu not available
              items = await apiService.getMenuItems();
            }
          } catch (error) {
            console.log('Failed to load restaurant menu, using default');
            items = await apiService.getMenuItems();
          }
        } else {
          // Default menu loading
          items = await apiService.getMenuItems();
        }
        
        setMenuItems(items);
        stopLoading();
      } catch (error) {
        setLoadingError('Failed to load data');
      } finally {
        setIsLoadingMenu(false);
      }
    };

    loadData();
  }, [location.state, setLoadingError, startLoading, stopLoading]);

  // Handle preference changes
  const handlePreferencesChange = (newPreferences) => {
    setMealPreferences(newPreferences);
    loadMealsWithPreferences(newPreferences);
  };

  // Save cart whenever it changes - removed since useCart handles this

  // Remove the cart manipulation functions since they're now in useCart hook

  // Remove the large filtering logic since it's now in MenuList component with useMemo

  // Quick Action Handlers - Frontend immediate responses
  const handleShowSimilar = (item) => {
    // Immediate frontend filtering for similar items
    const similarItems = menuItems.filter(menuItem => 
      menuItem.id !== item.id && (
        menuItem.cuisine === item.cuisine ||
        menuItem.category === item.category ||
        menuItem.chef === item.chef ||
        menuItem.diet === item.diet
      )
    );
    
    // Update search term to show the filtering is active
    setSearchTerm(`Similar to ${item.name}`);
    
    // Show immediate feedback
    const showCount = similarItems.length;
    if (showCount === 0) {
      alert(`No similar items found to ${item.name}. Try browsing our ${item.cuisine} cuisine or ${item.category} category!`);
      setSearchTerm('');
    } else {
      // Auto-clear after showing results
      setTimeout(() => {
        setSearchTerm(''); // Clear after showing results
      }, 5000); // Auto-clear after 5 seconds
    }
  };

  const handleFilterByCuisine = (cuisine) => {
    // Immediate frontend cuisine filtering
    setMealPreferences(prev => ({ ...prev, cuisine }));
    loadMealsWithPreferences({ ...mealPreferences, cuisine });
    
    // Show immediate feedback with search term
    setSearchTerm(`${cuisine} cuisine`);
    
    // Auto-clear search after showing results
    setTimeout(() => {
      setSearchTerm('');
    }, 3000);
  };

  const handleClearFilters = () => {
    // Clear all filters and reload default meals
    setMealPreferences({});
    setSearchTerm('');
    loadMealsWithPreferences({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => fromDiscovery ? navigate('/discover') : navigate('/')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-4"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🍴 {currentRestaurant ? `${currentRestaurant.name} Menu` : '🤖 AI Meal Matching'}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {currentRestaurant ? (
                    <>📍 {currentRestaurant.location?.address1}, {currentRestaurant.location?.city} • 
                    {currentRestaurant.rating}⭐ • {currentRestaurant.price || 'Price varies'}</>
                  ) : (
                    'Discover perfect meals from our partner restaurants'
                  )}
                </p>

                {currentRestaurant && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {currentRestaurant.location?.address1}, {currentRestaurant.location?.city} • 
                    {currentRestaurant.rating}⭐ • {currentRestaurant.price || 'Price varies'}
                  </p>
                )}

              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showPreferences
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🎯 AI Preferences
              </button>
              <DarkModeToggle />
              {fromDiscovery && (
                <button 
                  onClick={() => navigate('/discover')}
                  className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                >
                  🔍 Discover More
                </button>
              )}
              <button 
                onClick={() => navigate('/profile-setup')}
                className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
              >
                🎯 Profile
              </button>
              <button 
                onClick={() => navigate('/history')}
                className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                📋 History
              </button>
              <button 
                onClick={() => navigate('/ai-waitress')}
                className="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                💬 AI Waitress
              </button>
              <div className="relative">
                <button className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                  🛒 Cart ({totalItems})
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu */}
          <div className="flex-1">
            {/* AI Preferences Filter */}
            {showPreferences && (
              <MealPreferencesFilter
                onPreferencesChange={handlePreferencesChange}
                currentPreferences={mealPreferences}
              />
            )}

            {/* Search Bar and Filters */}
            <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              mealPreferences={mealPreferences}
              onFilterByCuisine={handleFilterByCuisine}
              onClearFilters={handleClearFilters}
            />

            {/* Menu Items List */}
            <MenuList
              menuItems={menuItems}
              searchTerm={searchTerm}
              isLoading={isLoadingMenu}
              onItemSelect={setSelectedItem}
              onAddToCart={addToCart}
              onShowSimilar={handleShowSimilar}
              onFilterByCuisine={handleFilterByCuisine}
            />

            {/* Restaurant Reviews - Only show when viewing a specific restaurant */}
            {currentRestaurant && (
              <div className="mt-8">
                <RestaurantReviews 
                  restaurantId={currentRestaurant.id} 
                  restaurantName={currentRestaurant.name}
                />
              </div>
            )}

            {/* No Results Message is now handled in MenuList */}
          </div>

          {/* Cart Sidebar */}
          <CartSummary
            cart={cart}
            updateQuantity={updateQuantity}
            getTotalPrice={getTotalPrice}
            totalItems={totalItems}
            loading={cartLoading}
            error={cartError}
          />
        </div>
      </div>

      {/* Item Details Modal */}
      <ItemDetailsModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onAddToCart={addToCart}
      />
    </div>
  );
}

export default CustomerInterface;
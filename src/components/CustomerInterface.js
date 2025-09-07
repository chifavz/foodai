import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import DarkModeToggle from './DarkModeToggle';
import { MenuItemSkeleton } from './SkeletonLoader';
import MealPreferencesFilter from './MealPreferencesFilter';
import apiService from '../services/api';

function CustomerInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  const [cart, setCart] = useState([]);
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
        
        // Load cart data
        const savedCart = await apiService.getCart();
        
        setMenuItems(items);
        setCart(savedCart);
        stopLoading();
      } catch (error) {
        setLoadingError('Failed to load data');
      } finally {
        setIsLoadingMenu(false);
      }
    };

    loadData();
  }, [startLoading, stopLoading, setLoadingError, location.state]);

  // Handle preference changes
  const handlePreferencesChange = (newPreferences) => {
    setMealPreferences(newPreferences);
    loadMealsWithPreferences(newPreferences);
  };

  // Save cart whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      apiService.saveCart(cart);
    }
  }, [cart]);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Simple text-based filtering (applied on top of preference filtering)
  const filteredItems = menuItems.filter(item => {
    const searchMatch = !searchTerm || 
                       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.chef.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  const closeModal = () => {
    setSelectedItem(null);
  };

  const ItemDetailsModal = ({ item, onClose }) => {
    if (!item) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-screen overflow-y-auto border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-6xl text-center mb-4">{item.image}</div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
            
            <div className="space-y-3 mb-6">
              {item.restaurant_name && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Restaurant</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.restaurant_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Chef</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.chef}</span>
              </div>
              {item.cuisine && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Cuisine</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.cuisine}</span>
                </div>
              )}
              {item.diet && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Diet</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{item.diet}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Rating</span>
                <div className="flex items-center">
                  <span className="text-yellow-400">⭐</span>
                  <span className="ml-1 text-gray-900 dark:text-white">{item.rating}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Category</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Price</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${item.price}</span>
              </div>
              
              {item.allergens && item.allergens.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Allergens</span>
                  <div className="flex flex-wrap gap-1">
                    {item.allergens.map(allergen => (
                      <span key={allergen} className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">🤖 AI Match Score</h4>
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                This meal matches your preferences and dietary requirements. Our AI recommends it based on your profile and past selections.
              </p>
            </div>
            
            <button
              onClick={() => {
                addToCart(item);
                onClose();
              }}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold"
            >
              Add to Cart - ${item.price}
            </button>
          </div>
        </div>
      </div>
    );
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
                  🛒 Cart ({cart.length})
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

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search within matched meals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500">
                  🔍
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600 dark:text-gray-400">
                  🤖 AI found {filteredItems.length} {filteredItems.length === 1 ? 'meal' : 'meals'} matching your preferences
                  {searchTerm && ` (filtered by "${searchTerm}")`}
                </p>
                {filteredItems.length > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    From {new Set(filteredItems.map(item => item.restaurant_name)).size} partner restaurants
                  </p>
                )}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {isLoadingMenu ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <MenuItemSkeleton key={index} />
                ))
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-6">
                      <div className="text-4xl text-center mb-4">{item.image}</div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      {/* Restaurant info */}
                      {item.restaurant_name && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg mb-3">
                          <div className="flex items-center text-sm">
                            <span className="text-blue-600 dark:text-blue-400">🏪</span>
                            <span className="text-blue-800 dark:text-blue-200 ml-1 font-medium">{item.restaurant_name}</span>
                          </div>
                          {item.cuisine && (
                            <div className="flex items-center text-xs text-blue-700 dark:text-blue-300 mt-1">
                              <span>🍽️ {item.cuisine} • {item.diet}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">by {item.chef}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">{item.rating}</span>
                        </div>
                      </div>
                      
                      {/* Allergen info */}
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex justify-between mb-3">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">Contains:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.allergens.map(allergen => (
                              <span key={allergen} className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${item.price}</span>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                      
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                      >
                        🛒 Add to Order
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {filteredItems.length === 0 && !isLoadingMenu && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No meals found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your preferences or search terms
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setMealPreferences({});
                    loadMealsWithPreferences({});
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">🤖 Your AI Selection</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We'll connect you with the restaurants for ordering
              </p>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Your selection is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">${item.price} each</p>
                          {item.restaurant_name && (
                            <p className="text-blue-600 dark:text-blue-400 text-xs">📍 {item.restaurant_name}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t dark:border-gray-600 pt-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        🎯 <strong>AI Referral Service:</strong> We'll connect you with each restaurant to place your order directly. No delivery fees from us!
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Estimated Total: ${getTotalPrice()}</span>
                    </div>
                    <button 
                      onClick={() => {
                        // Navigate to restaurant referral page
                        navigate('/checkout', { state: { cart } });
                      }}
                      className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold"
                    >
                      🏪 Connect with Restaurants
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Details Modal */}
      <ItemDetailsModal item={selectedItem} onClose={closeModal} />
    </div>
  );
}

export default CustomerInterface;
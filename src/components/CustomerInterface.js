import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import DarkModeToggle from './DarkModeToggle';
import apiService from '../services/api';

function CustomerInterface() {
  const navigate = useNavigate();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  const [cart, setCart] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Load menu items and cart on component mount
  useEffect(() => {
    const loadData = async () => {
      startLoading();
      try {
        const [items, savedCart] = await Promise.all([
          apiService.getMenuItems(),
          apiService.getCart()
        ]);
        setMenuItems(items);
        setCart(savedCart);
        stopLoading();
      } catch (error) {
        setLoadingError('Failed to load menu items');
      }
    };

    loadData();
  }, [startLoading, stopLoading, setLoadingError]);

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

  const categories = ['All', 'Appetizer', 'Main Course', 'Dessert'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = menuItems.filter(item => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    const searchMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.chef.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
              <button 
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-6xl text-center mb-4">{item.image}</div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Chef</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.chef}</span>
              </div>
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
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">🎯 Recommended for you</h4>
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                Based on your preferences, this dish matches your taste for {item.category.toLowerCase()} dishes!
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
                onClick={() => navigate('/')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🍴 Browse Menu</h1>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
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
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search dishes, chefs, or ingredients..."
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

            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 dark:bg-blue-700 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredItems.length} {filteredItems.length === 1 ? 'dish' : 'dishes'} found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div>

            {/* Menu Items */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-6">
                    <div className="text-4xl text-center mb-4">{item.image}</div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">by {item.chef}</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">{item.rating}</span>
                      </div>
                    </div>
                    
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
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No dishes found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or category filter
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Order</h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">${item.price} each</p>
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
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total: ${getTotalPrice()}</span>
                    </div>
                    <button 
                      onClick={() => {
                        // Navigate to checkout with cart data
                        navigate('/checkout', { state: { cart } });
                      }}
                      className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-semibold"
                    >
                      Proceed to Checkout
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
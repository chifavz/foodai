import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function CustomerInterface() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [showCheckout, setShowCheckout] = useState(false);
  const [menuItems] = useState([
    { id: 1, name: 'Grilled Salmon', price: 28, description: 'Fresh Atlantic salmon with lemon herbs', category: 'Main Course', chef: 'Chef Mario', rating: 4.8, image: '🐟' },
    { id: 2, name: 'Caesar Salad', price: 15, description: 'Crisp romaine lettuce with parmesan and croutons', category: 'Appetizer', chef: 'Chef Mario', rating: 4.6, image: '🥗' },
    { id: 3, name: 'Beef Wellington', price: 35, description: 'Tender beef wrapped in puff pastry with mushroom duxelles', category: 'Main Course', chef: 'Chef Isabella', rating: 4.9, image: '🥩' },
    { id: 4, name: 'Chocolate Soufflé', price: 12, description: 'Warm chocolate soufflé with vanilla ice cream', category: 'Dessert', chef: 'Chef Pierre', rating: 4.7, image: '🍰' },
    { id: 5, name: 'Lobster Bisque', price: 18, description: 'Rich and creamy lobster soup with a hint of brandy', category: 'Appetizer', chef: 'Chef Isabella', rating: 4.8, image: '🦞' },
    { id: 6, name: 'Margherita Pizza', price: 22, description: 'Traditional pizza with fresh mozzarella, tomatoes, and basil', category: 'Main Course', chef: 'Chef Antonio', rating: 4.5, image: '🍕' },
  ]);

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

  const deliveryOptions = [
    { id: 'delivery', label: 'Delivery', icon: '🚗', fee: 3.99, time: '30-45 min' },
    { id: 'pickup', label: 'Pickup', icon: '🚶‍♂️', fee: 0, time: '15-20 min' },
    { id: 'dine-in', label: 'Dine In', icon: '🍽️', fee: 0, time: 'Book table' }
  ];

  const handlePlaceOrder = () => {
    setShowCheckout(true);
  };

  const handleCheckout = () => {
    // TODO: Integrate with Stripe API
    console.log('Processing payment...', {
      cart,
      deliveryMethod,
      total: getTotalPrice() + (deliveryMethod === 'delivery' ? 3.99 : 0)
    });
    
    // Simulate successful order
    alert('Order placed successfully! You will receive a confirmation email shortly.');
    setCart([]);
    setShowCheckout(false);
    navigate('/profile');
  };

  const categories = ['All', 'Appetizer', 'Main Course', 'Dessert'];

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-700 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">🍴 Browse Menu</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/ai-waitress')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                💬 AI Waitress
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                👤 Profile
              </button>
              <div className="relative">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex space-x-4">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-6">
                    <div className="text-4xl text-center mb-4">{item.image}</div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-500 text-sm">by {item.chef}</span>
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-gray-600 text-sm ml-1">{item.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">${item.price}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Order</h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-gray-500 text-sm">${item.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {!showCheckout ? (
                    <div className="border-t pt-4">
                      {/* Delivery Options */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Delivery Method</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {deliveryOptions.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setDeliveryMethod(option.id)}
                              className={`p-3 border-2 rounded-lg text-center transition-all ${
                                deliveryMethod === option.id
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-lg mb-1">{option.icon}</div>
                              <div className="text-sm font-medium">{option.label}</div>
                              <div className="text-xs text-gray-600">
                                {option.fee > 0 ? `$${option.fee}` : 'Free'}
                              </div>
                              <div className="text-xs text-gray-500">{option.time}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-gray-700">
                          <span>Subtotal:</span>
                          <span>${getTotalPrice().toFixed(2)}</span>
                        </div>
                        {deliveryMethod === 'delivery' && (
                          <div className="flex justify-between text-gray-700">
                            <span>Delivery Fee:</span>
                            <span>$3.99</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                          <span>Total:</span>
                          <span>${(getTotalPrice() + (deliveryMethod === 'delivery' ? 3.99 : 0)).toFixed(2)}</span>
                        </div>
                      </div>

                      <button 
                        onClick={handlePlaceOrder}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Continue to Checkout
                      </button>
                    </div>
                  ) : (
                    <div className="border-t pt-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <h3 className="font-semibold text-gray-900">Payment Information</h3>
                        
                        {/* Payment Form - Placeholder for Stripe integration */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                            <input 
                              type="text" 
                              placeholder="1234 5678 9012 3456"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                              <input 
                                type="text" 
                                placeholder="MM/YY"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                              <input 
                                type="text" 
                                placeholder="123"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">🔒 Secure Payment with Stripe</p>
                            <p>Your payment information is encrypted and secure.</p>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button 
                            onClick={() => setShowCheckout(false)}
                            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                          >
                            Back to Cart
                          </button>
                          <button 
                            onClick={handleCheckout}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                          >
                            Place Order ${(getTotalPrice() + (deliveryMethod === 'delivery' ? 3.99 : 0)).toFixed(2)}
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerInterface;
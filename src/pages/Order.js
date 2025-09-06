import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import apiService from '../services/api';

export default function Order() {
  const navigate = useNavigate();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  const [cart, setCart] = useState([]);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    specialInstructions: '',
    serviceType: 'dine-in',
    paymentMethod: 'card'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [currentCart, userProfile] = await Promise.all([
          apiService.getCart(),
          apiService.getUserProfile()
        ]);
        
        setCart(currentCart);
        
        // Pre-fill form with user profile data
        if (userProfile) {
          setOrderForm(prev => ({
            ...prev,
            name: userProfile.name || '',
            serviceType: userProfile.servicePreference || 'dine-in'
          }));
        }
      } catch (error) {
        console.error('Failed to load order data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field, value) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getCartTotal() * 0.08; // 8% tax
  };

  const getDeliveryFee = () => {
    return orderForm.serviceType === 'delivery' ? 3.99 : 0;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getTax() + getDeliveryFee();
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setLoadingError('Your cart is empty');
      return;
    }

    startLoading();
    try {
      const orderData = {
        items: cart,
        customerInfo: orderForm,
        subtotal: getCartTotal(),
        tax: getTax(),
        deliveryFee: getDeliveryFee(),
        total: getFinalTotal(),
        status: 'confirmed',
        date: new Date().toLocaleString()
      };

      await apiService.placeOrder(orderData);
      
      // Clear cart after successful order
      await apiService.clearCart();
      
      stopLoading();
      
      // Navigate to tracking page
      navigate('/tracking');
    } catch (error) {
      setLoadingError('Failed to place order. Please try again.');
    }
  };

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    apiService.saveCart(updatedCart);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    apiService.saveCart(updatedCart);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/customer" className="text-purple-600 hover:text-purple-700 mr-4">
                ← Back to Menu
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">🛍️ Checkout</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Cart is Empty</h3>
            <p className="text-gray-600 mb-6">Add some delicious items to your cart before checkout!</p>
            <button
              onClick={() => navigate('/customer')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Information</h2>
                
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Service Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['dine-in', 'takeout', 'delivery'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleInputChange('serviceType', type)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            orderForm.serviceType === type
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-xl mb-1">
                            {type === 'dine-in' ? '🍽️' : type === 'takeout' ? '🥡' : '🚚'}
                          </div>
                          <div className="text-sm font-medium capitalize">
                            {type === 'dine-in' ? 'Dine In' : type === 'takeout' ? 'Takeout' : 'Delivery'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={orderForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={orderForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  {orderForm.serviceType === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                      <textarea
                        value={orderForm.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="3"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                    <textarea
                      value={orderForm.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="2"
                      placeholder="Any special requests or dietary notes..."
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
                        { value: 'cash', label: 'Cash', icon: '💵' }
                      ].map(method => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => handleInputChange('paymentMethod', method.value)}
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            orderForm.paymentMethod === method.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-xl mb-1">{method.icon}</div>
                          <div className="text-sm font-medium">{method.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    🎉 Place Order - ${getFinalTotal().toFixed(2)}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">by {item.chef}</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="mx-2 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-3 text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">${item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  {orderForm.serviceType === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>${getDeliveryFee().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${getFinalTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

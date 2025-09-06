import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import apiService from '../services/api';
import OrderButton from './OrderButton';

function OrderRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  const [cart, setCart] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Get cart from state or API service
  useEffect(() => {
    const loadCart = async () => {
      if (location.state?.cart) {
        setCart(location.state.cart);
      } else {
        // Try to get cart from API service as fallback
        try {
          const savedCart = await apiService.getCart();
          setCart(savedCart);
        } catch (error) {
          console.error('Failed to load cart:', error);
          setCart([]);
        }
      }
    };

    loadCart();
  }, [location.state]);

  const deliveryOptions = [
    {
      id: 'ubereats',
      name: 'Uber Eats',
      logo: '🚗',
      estimatedTime: '25-35 min',
      fee: 2.99,
      description: 'Fast delivery with real-time tracking'
    },
    {
      id: 'doordash',
      name: 'DoorDash',
      logo: '🏃‍♂️',
      estimatedTime: '20-30 min',
      fee: 3.49,
      description: 'Reliable delivery service'
    },
    {
      id: 'pickup',
      name: 'Pickup',
      logo: '🏪',
      estimatedTime: '15-20 min',
      fee: 0,
      description: 'Order ready for pickup at restaurant'
    },
    {
      id: 'dinein',
      name: 'Dine In',
      logo: '🍽️',
      estimatedTime: '10 min wait',
      fee: 0,
      description: 'Reserve a table and dine with us'
    }
  ];

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalWithFees = () => {
    const subtotal = getTotalPrice();
    const selectedOption = deliveryOptions.find(option => option.id === selectedDelivery);
    const deliveryFee = selectedOption ? selectedOption.fee : 0;
    const tax = subtotal * 0.08; // 8% tax
    return subtotal + deliveryFee + tax;
  };

  const handlePlaceOrder = async () => {
    if (!selectedDelivery) {
      alert('Please select a delivery method');
      return;
    }

    startLoading();

    try {
      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          name: item.name,
          chef: item.chef,
          price: item.price * item.quantity,
          rating: 0
        })),
        total: Math.round(getTotalWithFees()),
        status: 'Preparing',
        deliveryMethod: deliveryOptions.find(option => option.id === selectedDelivery)?.name,
        rated: false
      };

      // Place order using API service
      await apiService.placeOrder(orderData);

      // Clear current cart
      await apiService.clearCart();

      stopLoading();
      setOrderPlaced(true);

      // In real app, this would redirect to external service URLs with affiliate tracking
      setTimeout(() => {
        // Use actual affiliate links instead of alerts
        const restaurantId = 'demo-restaurant-123';
        const restaurantName = 'FoodAI Demo Restaurant';
        const affiliateId = process.env.REACT_APP_AFFILIATE_ID || 'YOUR_AFFILIATE_ID';
        
        if (selectedDelivery === 'ubereats') {
          const affiliateUrl = `https://www.ubereats.com/ubereats?aff_id=${affiliateId}&restaurant_id=${restaurantId}&search=${encodeURIComponent(restaurantName)}`;
          // window.open(affiliateUrl, '_blank');
          alert(`Redirecting to Uber Eats...\nAffiliate URL: ${affiliateUrl}\n(Demo mode - link disabled)`);
        } else if (selectedDelivery === 'doordash') {
          const affiliateUrl = `https://www.doordash.com/store/${restaurantId}?affiliate_id=${affiliateId}&q=${encodeURIComponent(restaurantName)}`;
          // window.open(affiliateUrl, '_blank');
          alert(`Redirecting to DoorDash...\nAffiliate URL: ${affiliateUrl}\n(Demo mode - link disabled)`);
        }
        navigate('/history');
      }, 2000);
    } catch (error) {
      setLoadingError('Failed to place order. Please try again.');
    }
  };

  const handleEditOrder = async () => {
    // Save current cart for editing using API service
    try {
      await apiService.saveCart(cart);
      navigate('/customer');
    } catch (error) {
      // Fallback to direct navigation if save fails
      navigate('/customer');
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">You'll be redirected to track your order...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-2xl font-bold text-gray-900">🛒 Checkout</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to your cart first!</p>
          <button
            onClick={() => navigate('/customer')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Browse Menu
          </button>
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
              <button 
                onClick={() => navigate('/customer')}
                className="text-blue-600 hover:text-blue-700 mr-4"
              >
                ← Back to Menu
              </button>
              <h1 className="text-2xl font-bold text-gray-900">🛒 Checkout</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 text-sm">by {item.chef}</p>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">${getTotalPrice().toFixed(2)}</span>
              </div>
              {selectedDelivery && deliveryOptions.find(option => option.id === selectedDelivery)?.fee > 0 && (
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="text-gray-900">${deliveryOptions.find(option => option.id === selectedDelivery)?.fee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax (8%):</span>
                <span className="text-gray-900">${(getTotalPrice() * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${getTotalWithFees().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleEditOrder}
              className="w-full mt-4 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              ✏️ Edit Order
            </button>
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Delivery Method</h2>
            
            <div className="space-y-3 mb-6">
              {deliveryOptions.map(option => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDelivery === option.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDelivery(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.logo}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{option.name}</h3>
                        <p className="text-gray-600 text-sm">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {option.fee > 0 ? `$${option.fee.toFixed(2)}` : 'Free'}
                      </p>
                      <p className="text-gray-600 text-sm">{option.estimatedTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!selectedDelivery}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                selectedDelivery
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedDelivery ? `Place Order - $${getTotalWithFees().toFixed(2)}` : 'Select delivery method'}
            </button>

            {selectedDelivery && ['ubereats', 'doordash'].includes(selectedDelivery) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3 text-center">
                  You'll be redirected to {deliveryOptions.find(option => option.id === selectedDelivery)?.name} to complete your order
                </p>
                <div className="space-y-2">
                  <OrderButton
                    platform={selectedDelivery}
                    restaurantId="demo-restaurant-123"
                    restaurantName="FoodAI Demo Restaurant"
                    cart={cart}
                    className="w-full text-sm"
                  />
                </div>
              </div>
            )}

            {selectedDelivery && !['ubereats', 'doordash'].includes(selectedDelivery) && (
              <p className="text-sm text-gray-600 mt-3 text-center">
                {selectedDelivery === 'pickup' ? 'Your order will be ready for pickup' : 'Your table will be prepared'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderRedirect;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import apiService from '../services/api';

export default function Feedback() {
  const navigate = useNavigate();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratings, setRatings] = useState({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const orderHistory = await apiService.getOrderHistory();
        // Filter for delivered orders only
        const deliveredOrders = orderHistory.filter(order => order.status === 'delivered');
        setOrders(deliveredOrders);
        
        // Auto-select the most recent delivered order
        if (deliveredOrders.length > 0) {
          setSelectedOrder(deliveredOrders[0]);
          // Initialize ratings for all items in the order
          const initialRatings = {};
          deliveredOrders[0].items.forEach(item => {
            initialRatings[item.id] = 5; // Default to 5 stars
          });
          setRatings(initialRatings);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    // Reset ratings for new order
    const initialRatings = {};
    order.items.forEach(item => {
      initialRatings[item.id] = 5; // Default to 5 stars
    });
    setRatings(initialRatings);
    setFeedback('');
    setSubmitted(false);
  };

  const handleRatingChange = (itemId, rating) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: rating
    }));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder) {
      setLoadingError('Please select an order to rate');
      return;
    }

    startLoading();
    try {
      const feedbackData = {
        orderId: selectedOrder.id,
        ratings,
        feedback,
        date: new Date().toLocaleString()
      };

      await apiService.submitOrderRating(selectedOrder.id, feedbackData);
      setSubmitted(true);
      stopLoading();
    } catch (error) {
      setLoadingError('Failed to submit feedback. Please try again.');
    }
  };

  const renderStars = (itemId, currentRating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(itemId, star)}
            className={`text-2xl transition-colors ${
              star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    const ratingValues = Object.values(ratings);
    if (ratingValues.length === 0) return 0;
    return (ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
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
              <Link to="/tracking" className="text-purple-600 hover:text-purple-700 mr-4">
                ← Back to Tracking
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">⭐ Rate Your Experience</h1>
            </div>
            <Link 
              to="/customer"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🛒 Order Again
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Orders</h3>
            <p className="text-gray-600 mb-6">You can only rate orders that have been delivered. Place an order first!</p>
            <button
              onClick={() => navigate('/customer')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Browse Menu
            </button>
          </div>
        ) : submitted ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Your Feedback!</h3>
            <p className="text-gray-600 mb-6">Your rating helps us improve our service and helps other customers make great choices.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/customer')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Order Again
              </button>
              <button
                onClick={() => navigate('/tracking')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                View Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Selection */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Order to Rate</h2>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleOrderSelect(order)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        Delivered
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.date}</p>
                    <p className="text-sm font-medium text-gray-900">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.items.length} items</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Form */}
            {selectedOrder && (
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Rate Order #{selectedOrder.id}</h2>
                      <p className="text-gray-600">{selectedOrder.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Overall Rating</p>
                      <p className="text-2xl font-bold text-yellow-600">⭐ {getAverageRating()}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitFeedback}>
                    {/* Item Ratings */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Each Item</h3>
                      <div className="space-y-6">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">by {item.chef}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 mb-2">Rate this item:</p>
                              {renderStars(item.id, ratings[item.id] || 5)}
                              <p className="text-xs text-gray-500 mt-1">
                                {ratings[item.id] === 1 ? 'Poor' :
                                 ratings[item.id] === 2 ? 'Fair' :
                                 ratings[item.id] === 3 ? 'Good' :
                                 ratings[item.id] === 4 ? 'Very Good' : 'Excellent'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Written Feedback */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments (Optional)
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="4"
                        placeholder="Tell us about your experience... What did you love? What could we improve?"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => navigate('/tracking')}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Skip for now
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        ⭐ Submit Rating
                      </button>
                    </div>
                  </form>

                  {/* Quick Actions */}
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate('/customer')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🛒 Order Again
                      </button>
                      <button
                        onClick={() => navigate('/recommendations')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        🎯 Get Recommendations
                      </button>
                      <button
                        onClick={() => navigate('/ai-waitress')}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        💬 Chat with AI Waitress
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

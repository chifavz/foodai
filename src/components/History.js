import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import apiService from '../services/api';

function History() {
  const navigate = useNavigate();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  const [orders, setOrders] = useState([]);
  const [ratingModal, setRatingModal] = useState({ show: false, order: null });

  // Load order history from API service
  useEffect(() => {
    const loadOrders = async () => {
      startLoading();
      try {
        let orderHistory = await apiService.getOrderHistory();
        
        // If no orders exist, add some mock data
        if (orderHistory.length === 0) {
          const mockOrders = [
            {
              id: 1,
              date: '2024-01-15',
              time: '7:30 PM',
              items: [
                { id: 1, name: 'Grilled Salmon', chef: 'Chef Mario', price: 28, rating: 5, quantity: 1 },
                { id: 2, name: 'Caesar Salad', chef: 'Chef Mario', price: 15, rating: 4, quantity: 1 }
              ],
              total: 43,
              status: 'Delivered',
              deliveryMethod: 'DoorDash',
              rated: true
            },
            {
              id: 2,
              date: '2024-01-12',
              time: '6:45 PM',
              items: [
                { id: 3, name: 'Beef Wellington', chef: 'Chef Isabella', price: 35, rating: 0, quantity: 1 },
                { id: 4, name: 'Chocolate Soufflé', chef: 'Chef Pierre', price: 12, rating: 0, quantity: 2 }
              ],
              total: 47,
              status: 'Delivered',
              deliveryMethod: 'Uber Eats',
              rated: false
            },
            {
              id: 3,
              date: '2024-01-10',
              time: '8:15 PM',
              items: [
                { id: 5, name: 'Margherita Pizza', chef: 'Chef Antonio', price: 22, rating: 4, quantity: 1 },
                { id: 6, name: 'Lobster Bisque', chef: 'Chef Isabella', price: 18, rating: 5, quantity: 1 }
              ],
              total: 40,
              status: 'Delivered',
              deliveryMethod: 'Pickup',
              rated: true
            }
          ];
          
          // Save mock orders directly to localStorage to avoid duplication
          localStorage.setItem('orderHistory', JSON.stringify(mockOrders));
          orderHistory = mockOrders;
        }
        
        setOrders(orderHistory);
        stopLoading();
      } catch (error) {
        setLoadingError('Failed to load order history');
      }
    };

    loadOrders();
  }, [startLoading, stopLoading, setLoadingError]);

  const handleRateOrder = (order) => {
    setRatingModal({ show: true, order });
  };

  const submitRating = async (orderId, ratings) => {
    try {
      // Update rating using API service
      await apiService.updateOrderRating(orderId, ratings);
      
      // Update local state
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map((item, index) => ({
            ...item,
            rating: ratings[index] || 0
          }));
          return { ...order, items: updatedItems, rated: true };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setRatingModal({ show: false, order: null });
    } catch (error) {
      console.error('Failed to submit rating:', error);
      // Still update local state as fallback
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map((item, index) => ({
            ...item,
            rating: ratings[index] || 0
          }));
          return { ...order, items: updatedItems, rated: true };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      setRatingModal({ show: false, order: null });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'In Transit': return 'bg-blue-100 text-blue-800';
      case 'Preparing': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const reorderItems = (order) => {
    // In real app, this would add items to cart and navigate to checkout
    navigate('/customer');
  };

  const RatingModal = ({ order, onSubmit, onClose }) => {
    const [ratings, setRatings] = useState(order?.items.map(() => 0) || []);

    const setRating = (itemIndex, rating) => {
      const newRatings = [...ratings];
      newRatings[itemIndex] = rating;
      setRatings(newRatings);
    };

    const handleSubmit = () => {
      onSubmit(order.id, ratings);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Your Order</h3>
          
          <div className="space-y-4 mb-6">
            {order?.items.map((item, index) => (
              <div key={index} className="border-b pb-3">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600 mb-2">by {item.chef}</p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(index, star)}
                      className={`text-2xl ${
                        star <= ratings[index] ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Ratings
            </button>
          </div>
        </div>
      </div>
    );
  };

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
              <h1 className="text-2xl font-bold text-gray-900">📋 Order History</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/ai-waitress')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                💬 AI Waitress
              </button>
              <button 
                onClick={() => navigate('/customer')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🍴 Browse Menu
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start your culinary journey by browsing our amazing menu!</p>
            <button
              onClick={() => navigate('/customer')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Dining History</h2>
              <p className="text-gray-600">Review your past orders and rate your experiences</p>
            </div>

            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <p className="text-gray-600">{order.date} at {order.time}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">via {order.deliveryMethod}</p>
                  </div>
                </div>

                <div className="border-t border-b py-4 my-4">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-gray-600 text-sm ml-2">by {item.chef}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {item.rating > 0 && (
                            <div className="flex items-center">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">${item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-gray-900">Total: ${order.total}</span>
                  </div>
                  <div className="flex space-x-3">
                    {!order.rated && order.status === 'Delivered' && (
                      <button
                        onClick={() => handleRateOrder(order)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        ⭐ Rate Order
                      </button>
                    )}
                    <button
                      onClick={() => reorderItems(order)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🔄 Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal.show && (
        <RatingModal
          order={ratingModal.order}
          onSubmit={submitRating}
          onClose={() => setRatingModal({ show: false, order: null })}
        />
      )}
    </div>
  );
}

export default History;
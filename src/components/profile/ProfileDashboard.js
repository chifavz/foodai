import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function ProfileDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  // Mock user data - in real app, this would come from Redux store or API
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '👨‍💼',
    memberSince: 'January 2024'
  };

  const orderHistory = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      restaurant: 'Chef Mario\'s Kitchen',
      items: ['Grilled Salmon', 'Caesar Salad'],
      total: 43,
      status: 'Delivered',
      rating: 5
    },
    {
      id: 'ORD-002',
      date: '2024-01-12',
      restaurant: 'Chef Isabella\'s Bistro',
      items: ['Beef Wellington', 'Chocolate Soufflé'],
      total: 47,
      status: 'Delivered',
      rating: 4
    },
    {
      id: 'ORD-003',
      date: '2024-01-10',
      restaurant: 'Chef Antonio\'s Pizzeria',
      items: ['Margherita Pizza'],
      total: 22,
      status: 'Delivered',
      rating: 5
    }
  ];

  const savedRestaurants = [
    {
      id: 1,
      name: 'Chef Mario\'s Kitchen',
      cuisine: 'Italian',
      rating: 4.8,
      chef: 'Chef Mario',
      lastOrdered: '2024-01-15'
    },
    {
      id: 2,
      name: 'Chef Isabella\'s Bistro',
      cuisine: 'French',
      rating: 4.9,
      chef: 'Chef Isabella',
      lastOrdered: '2024-01-12'
    },
    {
      id: 3,
      name: 'Chef Antonio\'s Pizzeria',
      cuisine: 'Italian',
      rating: 4.5,
      chef: 'Chef Antonio',
      lastOrdered: '2024-01-10'
    }
  ];

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const tabs = [
    { id: 'orders', label: 'Order History', icon: '📋' },
    { id: 'restaurants', label: 'Saved Restaurants', icon: '❤️' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'account', label: 'Account Settings', icon: '👤' }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{user.avatar}</div>
              <div>
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">Member since {user.memberSince}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
                  <div className="space-y-4">
                    {orderHistory.map(order => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">Order {order.id}</h3>
                            <p className="text-sm text-gray-600">{order.restaurant}</p>
                            <p className="text-sm text-gray-500">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">${order.total}</div>
                            <div className="text-sm text-gray-600">{order.status}</div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-sm text-gray-700">Items: {order.items.join(', ')}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            Rating: {renderStars(order.rating)}
                          </div>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                            Reorder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'restaurants' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Saved Restaurants</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedRestaurants.map(restaurant => (
                      <div key={restaurant.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                            <p className="text-sm text-gray-600">{restaurant.cuisine} • {restaurant.chef}</p>
                            <p className="text-sm text-gray-500">Last ordered: {restaurant.lastOrdered}</p>
                          </div>
                          <button className="text-red-500 hover:text-red-700">
                            ❤️
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            Rating: ⭐ {restaurant.rating}
                          </div>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                            View Menu
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences & Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Dietary Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Vegetarian', 'Gluten-Free'].map(pref => (
                          <span key={pref} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {pref}
                          </span>
                        ))}
                        <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200">
                          + Add
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Allergies</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Nuts', 'Shellfish'].map(allergy => (
                          <span key={allergy} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                            {allergy}
                          </span>
                        ))}
                        <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-200">
                          + Add
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/auth/preferences')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Preferences
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input 
                        type="text" 
                        value={user.name}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        value={user.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span className="text-gray-700">Order updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" defaultChecked />
                          <span className="text-gray-700">New restaurant recommendations</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3" />
                          <span className="text-gray-700">Promotional offers</span>
                        </label>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDashboard;
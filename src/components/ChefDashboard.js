import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ChefDashboard() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([
    { id: 1, name: 'Grilled Salmon', price: 28, description: 'Fresh Atlantic salmon with lemon herbs', category: 'Main Course', available: true },
    { id: 2, name: 'Caesar Salad', price: 15, description: 'Crisp romaine lettuce with parmesan and croutons', category: 'Appetizer', available: true },
    { id: 3, name: 'Chocolate Soufflé', price: 12, description: 'Warm chocolate soufflé with vanilla ice cream', category: 'Dessert', available: false },
  ]);

  const [orders] = useState([
    { id: 1, customer: 'Sarah M.', items: ['Grilled Salmon', 'Caesar Salad'], total: 43, status: 'Preparing', time: '15 mins ago' },
    { id: 2, customer: 'John D.', items: ['Caesar Salad'], total: 15, status: 'Ready', time: '5 mins ago' },
    { id: 3, customer: 'Emily R.', items: ['Grilled Salmon', 'Chocolate Soufflé'], total: 40, status: 'New', time: '2 mins ago' },
  ]);

  const toggleAvailability = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-green-100 text-green-800';
      case 'Preparing': return 'bg-yellow-100 text-yellow-800';
      case 'Ready': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                className="text-orange-600 hover:text-orange-700 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">👨‍🍳 Chef Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Chef Mario</span>
              <button 
                onClick={() => navigate('/ai-waitress')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                💬 AI Waitress
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Menu Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Menu Management</h2>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                + Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {menuItems.map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-orange-600 font-semibold">${item.price}</span>
                        <span className="text-gray-500 text-sm">{item.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={() => toggleAvailability(item.id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          item.available 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {item.available ? 'Hide' : 'Show'}
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">✏️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
            
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">Customer: {order.customer}</p>
                      <p className="text-gray-600 text-sm">Items: {order.items.join(', ')}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-green-600 font-semibold">${order.total}</span>
                        <span className="text-gray-500 text-sm">{order.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {order.status === 'New' && (
                        <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors">
                          Accept
                        </button>
                      )}
                      {order.status === 'Preparing' && (
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                          Mark Ready
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-gray-600 text-sm">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">24</div>
            <div className="text-gray-600 text-sm">Orders Today</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600">$580</div>
            <div className="text-gray-600 text-sm">Revenue Today</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">4.8</div>
            <div className="text-gray-600 text-sm">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">12</div>
            <div className="text-gray-600 text-sm">Menu Items</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChefDashboard;
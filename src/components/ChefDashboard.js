import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function GeneratedMenu() {
  const navigate = useNavigate();
  // Enhanced menu items with chef info, ratings, and images - API-like data structure
  const [menuItems] = useState([
    { id: 1, name: 'Grilled Salmon', price: 28, description: 'Fresh Atlantic salmon with lemon herbs', category: 'Main Course', chef: 'Chef Mario', rating: 4.8, image: '🐟', available: true },
    { id: 2, name: 'Caesar Salad', price: 15, description: 'Crisp romaine lettuce with parmesan and croutons', category: 'Appetizer', chef: 'Chef Mario', rating: 4.6, image: '🥗', available: true },
    { id: 3, name: 'Chocolate Soufflé', price: 12, description: 'Warm chocolate soufflé with vanilla ice cream', category: 'Dessert', chef: 'Chef Pierre', rating: 4.7, image: '🍰', available: false },
    { id: 4, name: 'Beef Wellington', price: 35, description: 'Tender beef wrapped in puff pastry with mushroom duxelles', category: 'Main Course', chef: 'Chef Isabella', rating: 4.9, image: '🥩', available: true },
    { id: 5, name: 'Lobster Bisque', price: 18, description: 'Rich and creamy lobster soup with a hint of brandy', category: 'Appetizer', chef: 'Chef Isabella', rating: 4.8, image: '🦞', available: true },
    { id: 6, name: 'Margherita Pizza', price: 22, description: 'Traditional pizza with fresh mozzarella, tomatoes, and basil', category: 'Main Course', chef: 'Chef Antonio', rating: 4.5, image: '🍕', available: true },
    { id: 7, name: 'Tiramisu', price: 10, description: 'Classic Italian dessert with coffee-soaked ladyfingers', category: 'Dessert', chef: 'Chef Antonio', rating: 4.6, image: '🍰', available: true },
  ]);

  const categories = ['All', 'Appetizer', 'Main Course', 'Dessert'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter items by category and availability
  const filteredItems = menuItems.filter(item => {
    const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
    return categoryMatch && item.available; // Only show available items
  });

  const getItemsByCategory = (category) => {
    return menuItems.filter(item => item.category === category && item.available).length;
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
              <h1 className="text-2xl font-bold text-gray-900">🍽️ Today's Menu</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/customer')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🛒 Order Now
              </button>
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
        {/* Category Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{getItemsByCategory('Appetizer')}</div>
            <div className="text-gray-600 text-sm">Appetizers</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{getItemsByCategory('Main Course')}</div>
            <div className="text-gray-600 text-sm">Main Courses</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{getItemsByCategory('Dessert')}</div>
            <div className="text-gray-600 text-sm">Desserts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{menuItems.filter(item => item.available).length}</div>
            <div className="text-gray-600 text-sm">Available Items</div>
          </div>
        </div>

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

        {/* Menu Items Grid */}
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
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Available
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No items message */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">😔</div>
            <p className="text-gray-500">No items available in this category at the moment.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="mt-4 text-blue-600 hover:text-blue-700 underline"
            >
              View all available items
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mt-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Order?</h2>
          <p className="mb-6">Browse our full menu with interactive ordering and cart functionality.</p>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/customer')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Browse & Order
            </button>
            <button 
              onClick={() => navigate('/ai-waitress')}
              className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors font-semibold"
            >
              Ask AI Waitress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneratedMenu;
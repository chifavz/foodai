import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="text-purple-600 hover:text-purple-700 mr-4">
                ← Back to Landing
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">🏠 Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to FoodAI</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your personalized dining experience starts here. Browse menus, chat with our AI waitress, 
            and discover amazing meals tailored to your preferences.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse & Order</h3>
            <p className="text-gray-600 mb-4">
              Explore our menu and add your favorite dishes to cart
            </p>
            <button
              onClick={() => navigate('/customer')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              Start Ordering
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Menu</h3>
            <p className="text-gray-600 mb-4">
              See today's available dishes from our talented chefs
            </p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors w-full"
            >
              View Today's Menu
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Waitress</h3>
            <p className="text-gray-600 mb-4">
              Chat with Sofia for personalized recommendations
            </p>
            <button
              onClick={() => navigate('/ai-waitress')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
            >
              Chat with Sofia
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h3>
            <p className="text-gray-600 mb-4">
              Get personalized meal suggestions based on your preferences
            </p>
            <button
              onClick={() => navigate('/recommendations')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full"
            >
              Get Recommendations
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Profile</h3>
            <p className="text-gray-600 mb-4">
              Manage your dining preferences and dietary restrictions
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors w-full"
            >
              View Profile
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Tracking</h3>
            <p className="text-gray-600 mb-4">
              Track your current orders and view order history
            </p>
            <button
              onClick={() => navigate('/tracking')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full"
            >
              Track Orders
            </button>
          </div>
        </div>

        {/* Recent Activity or Welcome Message */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Set Up Profile</h4>
              <p className="text-sm text-gray-600">Tell us your preferences for personalized recommendations</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Browse Menu</h4>
              <p className="text-sm text-gray-600">Explore dishes from talented chefs and add to cart</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-medium text-gray-900 mb-1">Enjoy Your Meal</h4>
              <p className="text-sm text-gray-600">Track your order and rate your experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

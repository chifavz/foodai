import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">🍽️ FoodAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Connect with Your
            <span className="block text-orange-600">AI Waitress</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Experience seamless dining where chefs showcase their culinary art and customers discover amazing meals, 
            all powered by our intelligent AI waitress.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mt-16">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Choose Your Experience</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Menu Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">View Menu</h4>
                <p className="text-gray-600 mb-6">
                  Browse today's available dishes from our talented chefs with detailed information and ratings.
                </p>
                <button
                  onClick={() => navigate('/chef')}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-300"
                >
                  View Today's Menu
                </button>
              </div>
            </div>

            {/* Customer Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="text-6xl mb-4">🍴</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">I'm Hungry</h4>
                <p className="text-gray-600 mb-6">
                  Discover amazing dishes, chat with our AI waitress, and enjoy personalized dining experiences.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/meal-finder')}
                    className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-300"
                  >
                    🎯 Find Perfect Meals
                  </button>
                  <button
                    onClick={() => navigate('/profile-setup')}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300"
                  >
                    🎯 Setup My Profile
                  </button>
                  <button
                    onClick={() => navigate('/customer')}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                  >
                    Browse Menu
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="w-full bg-gray-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-300"
                  >
                    📋 Order History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-12">Why Choose FoodAI?</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Assistance</h4>
              <p className="text-gray-600">Our intelligent waitress understands your preferences and provides personalized recommendations.</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Instant Connection</h4>
              <p className="text-gray-600">Connect chefs and customers in real-time for fresh, made-to-order culinary experiences.</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🌟</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Quality Guaranteed</h4>
              <p className="text-gray-600">Every dish is crafted by verified chefs committed to culinary excellence.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
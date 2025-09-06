import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Preferences() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="text-purple-600 hover:text-purple-700 mr-4">
                ← Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">⚙️ Preferences</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Preferences Management</h3>
          <p className="text-gray-600 mb-8">
            Manage your dining preferences and account settings. For now, use the Profile page to update your dining preferences.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">👤</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Dining Profile</h4>
              <p className="text-gray-600 mb-4">
                Update your dietary restrictions, cuisine preferences, and dining goals
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full"
              >
                Manage Profile
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h4>
              <p className="text-gray-600 mb-4">
                Get personalized meal recommendations based on your preferences
              </p>
              <button
                onClick={() => navigate('/recommendations')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
              >
                View Recommendations
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/customer')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🛒 Browse Menu
              </button>
              <button
                onClick={() => navigate('/ai-waitress')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                💬 Chat with AI Waitress
              </button>
              <button
                onClick={() => navigate('/tracking')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                📦 Order Tracking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

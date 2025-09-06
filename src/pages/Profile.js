import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import apiService from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { startLoading, stopLoading, setLoadingError } = useLoading();
  const [profile, setProfile] = useState({
    name: '',
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
    goals: [],
    budgetRange: '',
    mealFrequency: '',
    servicePreference: 'dine-in'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb', 'Dairy-Free'
  ];

  const allergyOptions = [
    'Nuts', 'Shellfish', 'Dairy', 'Eggs', 'Soy', 'Gluten', 'Fish'
  ];

  const cuisineOptions = [
    'Italian', 'French', 'Mediterranean', 'Asian', 'Mexican', 'American', 'Indian'
  ];

  const goalOptions = [
    'Weight Loss', 'Muscle Gain', 'Healthy Eating', 'Quick Meals', 'Gourmet Experience', 'Budget-Friendly'
  ];

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const userProfile = await apiService.getUserProfile();
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    startLoading();
    try {
      await apiService.saveUserProfile(profile);
      setIsEditing(false);
      stopLoading();
    } catch (error) {
      setLoadingError('Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
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
              <Link to="/" className="text-purple-600 hover:text-purple-700 mr-4">
                ← Back to Home
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">👤 My Profile</h1>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    💾 Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile.name && !isEditing ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Profile Set Up</h3>
            <p className="text-gray-600 mb-6">Set up your dining preferences to get personalized recommendations!</p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🎯 Set Up My Profile
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Your name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range per Meal</label>
                    {isEditing ? (
                      <select
                        value={profile.budgetRange}
                        onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select budget range</option>
                        <option value="$10-20">$10-20</option>
                        <option value="$20-30">$20-30</option>
                        <option value="$30-50">$30-50</option>
                        <option value="$50+">$50+</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.budgetRange || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Frequency</label>
                    {isEditing ? (
                      <select
                        value={profile.mealFrequency}
                        onChange={(e) => handleInputChange('mealFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select frequency</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="occasionally">Occasionally</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.mealFrequency || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Preference</label>
                    {isEditing ? (
                      <select
                        value={profile.servicePreference}
                        onChange={(e) => handleInputChange('servicePreference', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="dine-in">Dine In</option>
                        <option value="takeout">Takeout</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.servicePreference || 'Dine In'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
                
                {/* Goals */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      {goalOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleArrayToggle('goals', option)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            profile.goals.includes(option)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-900">{profile.goals.join(', ') || 'None selected'}</p>
                  )}
                </div>

                {/* Cuisine Preferences */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Cuisines</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      {cuisineOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleArrayToggle('cuisinePreferences', option)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            profile.cuisinePreferences.includes(option)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-900">{profile.cuisinePreferences.join(', ') || 'None selected'}</p>
                  )}
                </div>

                {/* Dietary Restrictions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      {dietaryOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleArrayToggle('dietaryRestrictions', option)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            profile.dietaryRestrictions.includes(option)
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-900">{profile.dietaryRestrictions.join(', ') || 'None'}</p>
                  )}
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      {allergyOptions.map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleArrayToggle('allergies', option)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            profile.allergies.includes(option)
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-900">{profile.allergies.join(', ') || 'None'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {!isEditing && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/recommendations')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🎯 Get Recommendations
                  </button>
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

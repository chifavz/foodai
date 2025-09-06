import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import DarkModeToggle from './DarkModeToggle';
import apiService from '../services/api';

function ProfileSetup() {
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
    servicePreference: 'dine-in'  // New field for dining preference
  });

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
    'Weight Loss', 'Muscle Gain', 'Healthy Eating', 'Energy Boost', 'Heart Health'
  ];

  const serviceOptions = [
    { value: 'dine-in', label: 'Dine-In', icon: '🍽️', description: 'Enjoy meals at the restaurant' },
    { value: 'delivery', label: 'Delivery', icon: '🚗', description: 'Have food delivered to you' },
    { value: 'pickup', label: 'Pickup', icon: '🥡', description: 'Order ahead and pickup' }
  ];

  const handleArrayToggle = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profile.name.trim()) {
      setLoadingError('Please enter your name');
      return;
    }

    startLoading();
    
    try {
      await apiService.saveUserProfile(profile);
      stopLoading();
      navigate('/customer');
    } catch (error) {
      setLoadingError('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">🍽️ Profile Setup</h1>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Personalize Your Dining Experience</h2>
            <p className="text-gray-600 dark:text-gray-400">Tell us about your preferences so our AI can recommend the perfect meals for you!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Optional)
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dietary Restrictions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {dietaryOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('dietaryRestrictions', option)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      profile.dietaryRestrictions.includes(option)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Allergies
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allergyOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('allergies', option)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      profile.allergies.includes(option)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Favorite Cuisines
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cuisineOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('cuisinePreferences', option)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      profile.cuisinePreferences.includes(option)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Health Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Health & Dietary Goals
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {goalOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleArrayToggle('goals', option)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      profile.goals.includes(option)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range per Meal
              </label>
              <select
                value={profile.budgetRange}
                onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select budget range</option>
                <option value="$10-20">$10 - $20</option>
                <option value="$20-35">$20 - $35</option>
                <option value="$35-50">$35 - $50</option>
                <option value="$50+">$50+</option>
              </select>
            </div>

            {/* Meal Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How often do you order food?
              </label>
              <select
                value={profile.mealFrequency}
                onChange={(e) => handleInputChange('mealFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="few-times-week">A few times a week</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="special-occasions">Special occasions only</option>
              </select>
            </div>

            {/* Service Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Dining Style
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {serviceOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('servicePreference', option.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      profile.servicePreference === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm mt-1 opacity-75">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Save Profile & Continue to Menu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;
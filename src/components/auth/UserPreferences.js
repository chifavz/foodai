import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function UserPreferences() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState({
    dietary: [],
    allergies: [],
    fitnessGoals: [],
    cuisinePreferences: []
  });

  const dietaryOptions = [
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { id: 'keto', label: 'Keto', icon: '🥑' },
    { id: 'paleo', label: 'Paleo', icon: '🥩' },
    { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
    { id: 'low-carb', label: 'Low Carb', icon: '🥒' },
    { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' }
  ];

  const allergyOptions = [
    { id: 'nuts', label: 'Nuts', icon: '🥜' },
    { id: 'shellfish', label: 'Shellfish', icon: '🦐' },
    { id: 'dairy', label: 'Dairy', icon: '🧀' },
    { id: 'eggs', label: 'Eggs', icon: '🥚' },
    { id: 'soy', label: 'Soy', icon: '🫘' },
    { id: 'gluten', label: 'Gluten', icon: '🍞' },
    { id: 'fish', label: 'Fish', icon: '🐟' },
    { id: 'sesame', label: 'Sesame', icon: '🌰' }
  ];

  const fitnessGoalOptions = [
    { id: 'weight-loss', label: 'Weight Loss', icon: '⚖️' },
    { id: 'muscle-gain', label: 'Muscle Gain', icon: '💪' },
    { id: 'athletic-performance', label: 'Athletic Performance', icon: '🏃‍♂️' },
    { id: 'general-health', label: 'General Health', icon: '❤️' },
    { id: 'endurance', label: 'Endurance Training', icon: '🚴‍♂️' },
    { id: 'strength', label: 'Strength Training', icon: '🏋️‍♂️' }
  ];

  const cuisineOptions = [
    { id: 'italian', label: 'Italian', icon: '🍝' },
    { id: 'asian', label: 'Asian', icon: '🍜' },
    { id: 'mexican', label: 'Mexican', icon: '🌮' },
    { id: 'indian', label: 'Indian', icon: '🍛' },
    { id: 'mediterranean', label: 'Mediterranean', icon: '🥗' },
    { id: 'american', label: 'American', icon: '🍔' },
    { id: 'french', label: 'French', icon: '🥐' },
    { id: 'japanese', label: 'Japanese', icon: '🍣' }
  ];

  const handleToggleOption = (category, optionId) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(optionId)
        ? prev[category].filter(id => id !== optionId)
        : [...prev[category], optionId]
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and redirect to customer interface
      console.log('User preferences:', preferences);
      navigate('/customer');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderOptionGrid = (options, category) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {options.map(option => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleToggleOption(category, option.id)}
          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
            preferences[category].includes(option.id)
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-2">{option.icon}</div>
          <div className="text-sm font-medium">{option.label}</div>
        </motion.button>
      ))}
    </div>
  );

  const steps = [
    {
      title: 'Dietary Preferences',
      subtitle: 'What describes your eating style?',
      content: renderOptionGrid(dietaryOptions, 'dietary')
    },
    {
      title: 'Allergies & Restrictions',
      subtitle: 'What should we avoid in your meals?',
      content: renderOptionGrid(allergyOptions, 'allergies')
    },
    {
      title: 'Fitness Goals',
      subtitle: 'What are your health and fitness objectives?',
      content: renderOptionGrid(fitnessGoalOptions, 'fitnessGoals')
    },
    {
      title: 'Cuisine Preferences',
      subtitle: 'What types of cuisine do you enjoy?',
      content: renderOptionGrid(cuisineOptions, 'cuisinePreferences')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Setup Your Preferences</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Current Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].subtitle}
            </p>
          </div>

          {steps[currentStep - 1].content}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
            >
              {currentStep === 4 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </motion.div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/customer')}
            className="text-gray-600 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserPreferences;
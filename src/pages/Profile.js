import React, { useState } from "react";

const Profile = () => {
  const [preferences, setPreferences] = useState({
    dietary: [],
    allergies: [],
    spiceLevel: "medium",
    cuisines: []
  });

  const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo"];
  const allergyOptions = ["Nuts", "Dairy", "Eggs", "Shellfish", "Soy"];
  const cuisineOptions = ["Italian", "Mexican", "Asian", "Mediterranean", "American"];

  const handleDietaryChange = (option) => {
    setPreferences(prev => ({
      ...prev,
      dietary: prev.dietary.includes(option)
        ? prev.dietary.filter(item => item !== option)
        : [...prev.dietary, option]
    }));
  };

  const handleAllergyChange = (option) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies.includes(option)
        ? prev.allergies.filter(item => item !== option)
        : [...prev.allergies, option]
    }));
  };

  const handleCuisineChange = (option) => {
    setPreferences(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(option)
        ? prev.cuisines.filter(item => item !== option)
        : [...prev.cuisines, option]
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">👤 Customer Profile & Preferences</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Food Preferences</h2>
          
          {/* Dietary Restrictions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Dietary Restrictions</h3>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleDietaryChange(option)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    preferences.dietary.includes(option)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Allergies</h3>
            <div className="flex flex-wrap gap-2">
              {allergyOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAllergyChange(option)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    preferences.allergies.includes(option)
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Spice Level */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Spice Level</h3>
            <div className="flex gap-2">
              {["mild", "medium", "hot"].map((level) => (
                <button
                  key={level}
                  onClick={() => setPreferences(prev => ({...prev, spiceLevel: level}))}
                  className={`px-6 py-2 rounded-lg border transition-colors capitalize ${
                    preferences.spiceLevel === level
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Cuisines */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Favorite Cuisines</h3>
            <div className="flex flex-wrap gap-2">
              {cuisineOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleCuisineChange(option)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    preferences.cuisines.includes(option)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Save Preferences
          </button>
        </div>

        {/* AI Waiter Chat Preview */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">🤖 AI Waiter Chat</h2>
          <div className="bg-gray-100 p-4 rounded-lg mb-4 max-h-64 overflow-y-auto">
            <div className="mb-4">
              <div className="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-xs">
                Hi! I'm your AI food assistant. Based on your preferences, I can recommend personalized meals. What are you in the mood for today?
              </div>
            </div>
            <div className="mb-4 text-right">
              <div className="bg-gray-300 text-gray-800 p-3 rounded-lg inline-block max-w-xs">
                Something healthy but tasty!
              </div>
            </div>
            <div className="mb-4">
              <div className="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-xs">
                Perfect! Based on your preferences for {preferences.dietary.join(", ") || "balanced nutrition"}, I recommend our Mediterranean Bowl with quinoa, fresh vegetables, and tahini dressing. Would you like to see the full menu?
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';

export default function Recommendations() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const generateRecommendations = (menuItems, userProfile) => {
      if (!userProfile) {
        // If no profile, return popular items
        return menuItems
          .filter(item => item.rating >= 4.5)
          .slice(0, 6)
          .map(item => ({ ...item, reason: 'Popular choice with high ratings' }));
      }

      const recommendations = [];

      // Filter by dietary restrictions
      const availableItems = menuItems.filter(item => {
        if (!userProfile.dietaryRestrictions) return true;
        
        const itemTags = item.tags || [];
        return userProfile.dietaryRestrictions.every(restriction => {
          switch (restriction) {
            case 'Vegetarian':
              return itemTags.includes('vegetarian') || item.category === 'Salad';
            case 'Vegan':
              return itemTags.includes('vegan');
            case 'Gluten-Free':
              return itemTags.includes('gluten-free');
            case 'Keto':
              return itemTags.includes('keto') || item.category === 'Main Course';
            case 'Low-Carb':
              return itemTags.includes('low-carb') || item.category !== 'Dessert';
            default:
              return true;
          }
        });
      });

      // Recommend based on cuisine preferences
      if (userProfile.cuisinePreferences && userProfile.cuisinePreferences.length > 0) {
        const cuisineMatches = availableItems.filter(item => 
          userProfile.cuisinePreferences.some(cuisine => 
            item.description.toLowerCase().includes(cuisine.toLowerCase()) ||
            item.name.toLowerCase().includes(cuisine.toLowerCase())
          )
        );
        
        cuisineMatches.forEach(item => {
          recommendations.push({
            ...item,
            reason: `Matches your love for ${userProfile.cuisinePreferences.join(', ')} cuisine`
          });
        });
      }

      // Recommend based on budget
      if (userProfile.budgetRange) {
        const [min, max] = getBudgetRange(userProfile.budgetRange);
        const budgetFriendly = availableItems.filter(item => 
          item.price >= min && item.price <= max
        );
        
        budgetFriendly.slice(0, 2).forEach(item => {
          if (!recommendations.find(r => r.id === item.id)) {
            recommendations.push({
              ...item,
              reason: `Perfect for your ${userProfile.budgetRange} budget`
            });
          }
        });
      }

      // Recommend based on goals
      if (userProfile.goals && userProfile.goals.length > 0) {
        userProfile.goals.forEach(goal => {
          let goalItems = [];
          switch (goal) {
            case 'Weight Loss':
              goalItems = availableItems.filter(item => 
                item.category === 'Appetizer' || 
                item.description.toLowerCase().includes('salad') ||
                item.description.toLowerCase().includes('grilled')
              );
              break;
            case 'Muscle Gain':
              goalItems = availableItems.filter(item => 
                item.description.toLowerCase().includes('protein') ||
                item.description.toLowerCase().includes('beef') ||
                item.description.toLowerCase().includes('chicken')
              );
              break;
            case 'Healthy Eating':
              goalItems = availableItems.filter(item => 
                item.rating >= 4.5 && 
                (item.category === 'Appetizer' || item.description.toLowerCase().includes('fresh'))
              );
              break;
            case 'Quick Meals':
              goalItems = availableItems.filter(item => 
                item.category === 'Appetizer' || 
                item.description.toLowerCase().includes('quick')
              );
              break;
            case 'Gourmet Experience':
              goalItems = availableItems.filter(item => 
                item.price >= 25 && item.rating >= 4.7
              );
              break;
            case 'Budget-Friendly':
              goalItems = availableItems.filter(item => item.price <= 20);
              break;
            default:
              goalItems = [];
              break;
          }
          
          goalItems.slice(0, 1).forEach(item => {
            if (!recommendations.find(r => r.id === item.id)) {
              recommendations.push({
                ...item,
                reason: `Recommended for your ${goal} goal`
              });
            }
          });
        });
      }

      // Add high-rated items if we don't have enough recommendations
      if (recommendations.length < 6) {
        const highRated = availableItems
          .filter(item => item.rating >= 4.7 && !recommendations.find(r => r.id === item.id))
          .slice(0, 6 - recommendations.length);
        
        highRated.forEach(item => {
          recommendations.push({
            ...item,
            reason: 'Highly rated by other customers'
          });
        });
      }

      return recommendations.slice(0, 6);
    };

    const loadData = async () => {
      setLoading(true);
      try {
        const [userProfile, menuItems, currentCart] = await Promise.all([
          apiService.getUserProfile(),
          apiService.getMenuItems(),
          apiService.getCart()
        ]);
        
        setProfile(userProfile);
        setCart(currentCart);
        
        // Generate recommendations based on user profile
        const filtered = generateRecommendations(menuItems, userProfile);
        setRecommendations(filtered);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);



  const getBudgetRange = (budgetString) => {
    switch (budgetString) {
      case '$10-20': return [10, 20];
      case '$20-30': return [20, 30];
      case '$30-50': return [30, 50];
      case '$50+': return [50, 100];
      default: return [0, 100];
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    const updatedCart = existingItem
      ? cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      : [...cart, { ...item, quantity: 1 }];

    setCart(updatedCart);
    apiService.saveCart(updatedCart);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your personalized recommendations...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">🎯 Recommendations</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                to="/customer"
                className="text-gray-600 hover:text-gray-700"
              >
                Browse All Menu
              </Link>
              <Link 
                to="/profile"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                👤 Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Up Your Profile</h3>
            <p className="text-gray-600 mb-6">Tell us about your preferences to get personalized recommendations!</p>
            <button
              onClick={() => navigate('/profile-setup')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🎯 Set Up Profile
            </button>
          </div>
        ) : (
          <>
            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Based on Your Preferences</h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Cuisines:</span>
                  <span className="ml-2 text-gray-600">
                    {profile.cuisinePreferences?.join(', ') || 'Any'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Budget:</span>
                  <span className="ml-2 text-gray-600">
                    {profile.budgetRange || 'Any'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Goals:</span>
                  <span className="ml-2 text-gray-600">
                    {profile.goals?.join(', ') || 'General'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recommendations Available</h3>
                <p className="text-gray-600 mb-6">We couldn't find items matching your preferences. Try browsing the full menu!</p>
                <button
                  onClick={() => navigate('/customer')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Browse Full Menu
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-4xl">{item.image}</div>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                          ⭐ {item.rating}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-blue-800 text-sm font-medium">💡 {item.reason}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold text-gray-900">${item.price}</span>
                          <p className="text-sm text-gray-600">by {item.chef}</p>
                        </div>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Want More Options?</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => navigate('/customer')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🛒 Browse Full Menu
                  </button>
                  <button
                    onClick={() => navigate('/ai-waitress')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    💬 Ask AI Waitress
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ⚙️ Update Preferences
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

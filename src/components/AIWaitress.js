import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MealService from '../services/MealService';
import RestaurantService from '../services/RestaurantService';
import apiService from '../services/api';

// Mock function for restaurants (since fetchRestaurants is not defined)
const fetchRestaurants = () => {
  return Promise.resolve([
    { name: "Bistro Milano", cuisine: "Italian", location: "Downtown" },
    { name: "Sakura Sushi", cuisine: "Japanese", location: "Midtown" },
    { name: "Le Petit Café", cuisine: "French", location: "Arts District" }
  ]);
};

function AIWaitress() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm Sofia, your AI waitress. I'm here to help you discover amazing dishes, answer questions about our menu, and assist with your dining experience. How can I help you today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Mini discovery UI state
  const [showDiscoveryUI, setShowDiscoveryUI] = useState(true);
  const [discoveryMeals, setDiscoveryMeals] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [cart, setCart] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial meals for discovery UI
  useEffect(() => {
    loadDiscoveryMeals();
    loadCart();
  }, []);

  const loadDiscoveryMeals = async (cuisine = 'All') => {
    setIsLoadingMeals(true);
    try {
      const params = cuisine !== 'All' ? { cuisine } : {};
      const result = await apiService.getMeals(params);
      setDiscoveryMeals(result.meals.slice(0, 6)); // Show only first 6 meals
    } catch (error) {
      console.error('Failed to load discovery meals:', error);
      setDiscoveryMeals([]);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const loadCart = async () => {
    try {
      const currentCart = await apiService.getCart();
      setCart(currentCart);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const handleCuisineFilter = (cuisine) => {
    setSelectedCuisine(cuisine);
    loadDiscoveryMeals(cuisine);
  };

  const addToCartFromDiscovery = async (meal) => {
    try {
      const existingItem = cart.find(item => item.id === meal.id);
      let updatedCart;
      
      if (existingItem) {
        updatedCart = cart.map(item =>
          item.id === meal.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...cart, { ...meal, quantity: 1 }];
      }
      
      setCart(updatedCart);
      await apiService.saveCart(updatedCart);
      
      // Add a confirmation message to chat
      const confirmationMessage = {
        id: messages.length + 1,
        type: 'ai',
        content: `✅ Added "${meal.name}" to your cart! You now have ${existingItem ? existingItem.quantity + 1 : 1} of this item.`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  // Get contextual smart prompts based on time of day and user behavior
  const getSmartPrompts = () => {
    const hour = new Date().getHours();
    const isBreakfast = hour >= 6 && hour < 11;
    const isLunch = hour >= 11 && hour < 16;
    const isDinner = hour >= 16 && hour < 22;
    const isLateNight = hour >= 22 || hour < 6;

    let timeBasedPrompts = [];
    
    if (isBreakfast) {
      timeBasedPrompts = [
        "What's good for breakfast?",
        "Something light to start the day?",
        "Quick breakfast options?",
      ];
    } else if (isLunch) {
      timeBasedPrompts = [
        "What's popular for lunch?",
        "Something quick for lunch?", 
        "Light lunch recommendations?",
      ];
    } else if (isDinner) {
      timeBasedPrompts = [
        "What's perfect for dinner?",
        "Show me chef specialties",
        "Something hearty for dinner?",
      ];
    } else if (isLateNight) {
      timeBasedPrompts = [
        "Any late-night options?",
        "Something light and easy?",
        "Quick bite recommendations?",
      ];
    }

    // Enhanced base prompts with quick actions
    const basePrompts = [
      "Show me all restaurants",
      "Filter by cuisine",
      "Show similar dishes",
      "Quick Italian food",
      "Vegetarian options",
      "Help me find similar items",
      "Fast filtering options"
    ];

    // Mix time-based and base prompts
    return [...timeBasedPrompts.slice(0, 2), ...basePrompts.slice(0, 5)];
  };

  const quickQuestions = getSmartPrompts();

  const addMessage = (from, content, type = 'text') => {
    setMessages(prev => [...prev, { from, content, type, id: prev.length + 1, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {

      const userMessage = messageToProcess.toLowerCase();

      // Check if this is a restaurant discovery request using the API service logic
      if (apiService.isRestaurantDiscoveryRequest(userMessage)) {
        try {
          // Extract location, cuisine, and price from the message
          const location = apiService.extractLocation(messageToProcess) || 'downtown';
          const cuisine = apiService.extractCuisine(messageToProcess) || 'restaurants';
          const maxPrice = apiService.extractPrice(messageToProcess);

          // Use enhanced search with multiple providers
          const restaurants = await apiService.searchRestaurants(location, cuisine, 5, 'both');

          if (restaurants && restaurants.length > 0) {
            // Filter by price if specified
            let filteredRestaurants = restaurants;
            if (maxPrice) {
              filteredRestaurants = restaurants.filter(restaurant => {
                if (restaurant.price) {
                  // Extract numeric value from price (e.g., "$" = 1, "$$" = 2, etc.)
                  const priceLevel = restaurant.price.length || 2;
                  const estimatedPrice = priceLevel * 12; // Rough estimation: $ = $12, $$ = $24, etc.
                  return estimatedPrice <= maxPrice;
                }
                return true; // Include restaurants without price info
              });
            }

            if (filteredRestaurants.length > 0) {
              const priceNote = maxPrice ? ` under $${maxPrice}` : '';
              const responseText = `Great! I found ${filteredRestaurants.length} excellent ${cuisine} restaurant${filteredRestaurants.length > 1 ? 's' : ''}${priceNote} ${location}:`;
              
              // Add the response text first
              addMessage('ai', responseText);
              
              // Then add the restaurant cards
              addMessage('ai', filteredRestaurants, 'restaurants');
              
              setIsTyping(false);
              return;
            } else {
              addMessage('ai', `I found some ${cuisine} restaurants ${location}, but none within your budget of $${maxPrice}. Would you like to:\n1. Increase your budget range\n2. Browse our current menu for affordable options\n3. Try a different cuisine type`);
              setIsTyping(false);
              return;
            }
          } else {
            addMessage('ai', `I'm sorry, I couldn't find specific restaurants in that area right now. However, I can show you our current menu with some amazing dishes! We have Italian options like Margherita Pizza, fresh Grilled Salmon, and more. Would you like to browse our available dishes?`);
            setIsTyping(false);
            return;
          }
        } catch (error) {
          console.error('Restaurant discovery failed:', error);
          addMessage('ai', `I'd love to help you find restaurants! While I search for options, would you like to browse our current menu? We have some fantastic dishes available right now.`);
          setIsTyping(false);
          return;
        }
      }

      // Show partner restaurants
      if (userMessage.includes('show me all restaurants') || userMessage.includes('restaurants')) {
        const restaurants = await RestaurantService.getPartnerRestaurants();
        if (restaurants.length === 0) {
          addMessage('ai', 'Sorry, no restaurants found.');
        } else {
          addMessage('ai', restaurants, 'restaurants');
        }
        setIsTyping(false);
        return;
      }

      
      // IMMEDIATE FRONTEND RESPONSES - Handle common queries instantly
      if (userMessage.includes('filter') && userMessage.includes('cuisine')) {
        const aiMessage = {
          id: messages.length + 2,
          type: 'ai',
          content: "I can help you filter by cuisine right away! Here are our available cuisines:",
          timestamp: new Date().toLocaleTimeString(),
          actions: [
            {
              label: "🍝 Italian",
              action: () => navigate('/customer?cuisine=Italian')
            },
            {
              label: "🥖 French", 
              action: () => navigate('/customer?cuisine=French')
            },
            {
              label: "🍣 Japanese",
              action: () => navigate('/customer?cuisine=Japanese')
            },
            {
              label: "🥗 Vegetarian",
              action: () => navigate('/customer?cuisine=Vegetarian')
            }
          ]
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        return;
      }

      if (userMessage.includes('show similar') || userMessage.includes('similar dishes')) {
        const aiMessage = {
          id: messages.length + 2,
          type: 'ai',
          content: "Great! When you're browsing our menu, look for the '🔍 Show Similar' button on each dish. It will instantly show you similar items based on cuisine, category, chef, or dietary preferences!",
          timestamp: new Date().toLocaleTimeString(),
          actions: [
            {
              label: "📋 Browse Menu",
              action: () => navigate('/customer')
            }
          ]
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        return;
      }

      if (userMessage.includes('quick') || userMessage.includes('fast') || userMessage.includes('immediate')) {
        const aiMessage = {
          id: messages.length + 2,
          type: 'ai',
          content: "I'm designed for quick responses! Here are some instant actions you can take:",
          timestamp: new Date().toLocaleTimeString(),
          actions: [
            {
              label: "🍽️ Quick Cuisine Filters",
              action: () => navigate('/customer')
            },
            {
              label: "🔍 Show Similar Items",
              action: () => navigate('/customer')
            },
            {
              label: "🎯 AI Preferences",
              action: () => navigate('/customer')
            }
          ]
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        return;
      }
      
      // Enhanced AI logic with mock backend integration
      if (userMessage.includes('restaurant') || userMessage.includes('places') || userMessage.includes('where')) {
        try {
          // Use mock backend to fetch restaurants
          const restaurants = await fetchRestaurants();
          
          let aiResponse = "I found these amazing restaurants for you:\n\n";
          restaurants.forEach((restaurant, index) => {
            aiResponse += `${index + 1}. **${restaurant.name}** (${restaurant.cuisine})\n   📍 ${restaurant.location}\n\n`;
          });
          aiResponse += "Would you like me to show you the menu for any of these restaurants? Just ask me about a specific restaurant!";
          
          const aiMessage = {
            id: messages.length + 2,
            type: 'ai',
            content: aiResponse,
            timestamp: new Date().toLocaleTimeString()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
          return;
        } catch (error) {
          console.error('Failed to fetch restaurants:', error);
          addMessage('ai', "I'm having trouble finding restaurants right now. Please try again later!");
        }
        setIsTyping(false);
        return;
      }

      // Show meals
      if (userMessage.includes('show me meals') || userMessage.includes('menu') || userMessage.includes('food')) {
        const meals = await MealService.getMealsFiltered();
        if (meals.length === 0) {
          addMessage('ai', 'I couldn\'t find any meals matching your criteria.');
        } else {
          addMessage('ai', meals, 'meals');
        }
        setIsTyping(false);
        return;
      }

      // Default response
      addMessage('ai', "I can help you with menu info, recommendations, dietary requirements, and placing orders. What would you like to know more about?");
      setIsTyping(false);
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback to local response
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later!",
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
              >
                🍽️ FoodAI
              </button>
              <div className="ml-4 text-lg font-semibold text-gray-900">
                💬 AI Waitress - Sofia
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/customer')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🛒 Menu {cart.length > 0 && <span className="ml-1 bg-white text-blue-600 rounded-full px-2 py-1 text-xs">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
              </button>
              <button
                onClick={() => navigate('/profile-setup')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                🎯 Profile
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center">
              <div className="text-3xl mr-3">🤖</div>
              <div>
                <h2 className="text-xl font-semibold text-white">Sofia - Your AI Waitress</h2>
                <p className="text-purple-100 text-sm">Ask me about menu, dietary needs, recommendations, or help with ordering!</p>
              </div>
              <div className="ml-auto">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Mini Food Discovery UI */}
          {showDiscoveryUI && (
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">🍽️ Quick Discovery</h3>
                <button
                  onClick={() => setShowDiscoveryUI(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕ Hide
                </button>
              </div>
              
              {/* Quick Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['All', 'Italian', 'French', 'Japanese', 'Vegetarian'].map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => handleCuisineFilter(cuisine)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedCuisine === cuisine
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine === 'All' ? '🍽️ All' : 
                     cuisine === 'Italian' ? '🍝 Italian' :
                     cuisine === 'French' ? '🥖 French' :
                     cuisine === 'Japanese' ? '🍣 Japanese' :
                     '🥗 Vegetarian'}
                  </button>
                ))}
              </div>

              {/* Meals Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {isLoadingMeals ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-sm animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))
                ) : (
                  discoveryMeals.map(meal => (
                    <div key={meal.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-center mb-2">
                        <div className="text-2xl mb-1">{meal.image}</div>
                        <h4 className="font-semibold text-sm text-gray-900 leading-tight">{meal.name}</h4>
                        <p className="text-xs text-gray-600">{meal.restaurant_name}</p>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-purple-600">${meal.price}</span>
                        <div className="flex items-center text-yellow-500 text-xs">
                          <span>⭐</span>
                          <span className="ml-1">{meal.rating}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCartFromDiscovery(meal)}
                        className="w-full bg-purple-600 text-white text-xs py-2 rounded-md hover:bg-purple-700 transition-colors"
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              {!isLoadingMeals && discoveryMeals.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No meals found for this cuisine. Try a different filter!</p>
                </div>
              )}
              
              {/* View More Button */}
              {discoveryMeals.length > 0 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => navigate('/customer')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    View Full Menu →
                  </button>
                </div>
              )}
            </div>
          )}

          {!showDiscoveryUI && (
            <div className="px-6 py-2 bg-gray-50 border-b">
              <button
                onClick={() => setShowDiscoveryUI(true)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                🍽️ Show Quick Discovery
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🤖</span>
                      <span className="font-semibold text-sm">Sofia</span>
                    </div>
                  )}
                  
                  {message.type && message.type !== 'text' ? (
                    <>
                      {message.type === 'restaurants' && (
                        <div className="space-y-3">
                          {message.content.map(r => (
                            <div key={r.id || r.name} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                              {/* Restaurant Header */}
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900 text-lg">{r.name}</h4>
                                <div className="flex items-center space-x-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span className="text-sm text-gray-600">{r.rating || 'N/A'}</span>
                                </div>
                              </div>
                              
                              {/* Cuisine Type */}
                              <p className="text-sm text-gray-600 mb-2">
                                {r.categories?.join(' • ') || r.cuisine || 'Restaurant'}
                              </p>
                              
                              {/* Address */}
                              <div className="flex items-start space-x-2 mb-2">
                                <span className="text-gray-500">📍</span>
                                <p className="text-sm text-gray-700">
                                  {r.location?.address1 || r.location || 'Address not available'}
                                  {r.location?.city && `, ${r.location.city}`}
                                </p>
                              </div>
                              
                              {/* Hours & Price */}
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center space-x-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    r.is_closed === false 
                                      ? 'bg-green-100 text-green-800' 
                                      : r.is_closed === true 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {r.is_closed === false ? '🟢 Open Now' : 
                                     r.is_closed === true ? '🔴 Closed' : 
                                     '❓ Hours Unknown'}
                                  </span>
                                  <span className="text-sm font-medium text-green-600">
                                    {r.price || 'Price varies'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Service Options */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  🍽️ Dine-in
                                </span>
                                {(r.phone || r.display_phone) && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                    📱 Pickup
                                  </span>
                                )}
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  🚚 Delivery
                                </span>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex space-x-2">
                                {r.url && (
                                  <a 
                                    href={r.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                  >
                                    📋 View Menu
                                  </a>
                                )}
                                {(r.phone || r.display_phone) && (
                                  <a 
                                    href={`tel:${r.phone || r.display_phone}`}
                                    className="flex-1 text-center px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                  >
                                    📞 Call to Order
                                  </a>
                                )}
                                {r.affiliateLink && (
                                  <a 
                                    href={r.affiliateLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex-1 text-center px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                                  >
                                    🛒 Order Online
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {message.type === 'meals' && (
                        <div className="cards">
                          {message.content.map(m => (
                            <div key={m.id} className="card border border-gray-200 p-3 mb-2 rounded-lg bg-white">
                              <h4 className="font-semibold text-gray-900">{m.name} - ${m.price}</h4>
                              <p className="text-sm text-gray-600">{m.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Restaurant: {m.restaurant_name}</p>
                              {m.affiliateLink && (
                                <a href={m.affiliateLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors">
                                  Order Now
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  )}
                  {message.actions && (
                    <div className="mt-3 space-y-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.action}
                          className="block w-full text-left px-3 py-2 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">🤖</span>
                    <span className="font-semibold text-sm">Sofia</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="px-6 py-4 border-t">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Sofia anything about our menu, dietary needs, or recommendations..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  inputMessage.trim() && !isTyping
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What Sofia can help you with:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🍽️</div>
              <h4 className="font-semibold text-gray-900 mb-2">Menu Information</h4>
              <p className="text-sm text-gray-600">Get details about dishes, ingredients, and chef specialties</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-2">Personalized Recommendations</h4>
              <p className="text-sm text-gray-600">Based on your profile, dietary needs, and preferences</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🛒</div>
              <h4 className="font-semibold text-gray-900 mb-2">Order Assistance</h4>
              <p className="text-sm text-gray-600">Help with placing orders, modifications, and pairings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIWaitress;
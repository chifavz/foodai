import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MealService from '../services/MealService';
import RestaurantService from '../services/RestaurantService';

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      // Show partner restaurants
      if (userMessage.includes('show me all restaurants') || userMessage.includes('restaurants')) {
        const restaurants = await RestaurantService.getPartnerRestaurants();
        if (restaurants.length === 0) {
          addMessage('ai', 'Sorry, no restaurants found.');
        } else {
          addMessage('ai', restaurants, 'restaurants');

      // Check if user is asking about restaurants or menus
      const message = messageToProcess.toLowerCase();
      
      // IMMEDIATE FRONTEND RESPONSES - Handle common queries instantly
      if (message.includes('filter') && message.includes('cuisine')) {
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

      if (message.includes('show similar') || message.includes('similar dishes')) {
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

      if (message.includes('quick') || message.includes('fast') || message.includes('immediate')) {
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
      if (message.includes('restaurant') || message.includes('places') || message.includes('where')) {
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
                🛒 Menu
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
                        <div className="cards">
                          {message.content.map(r => (
                            <div key={r.id} className="card border border-gray-200 p-3 mb-2 rounded-lg bg-white">
                              <h4 className="font-semibold text-gray-900">{r.name}</h4>
                              <p className="text-sm text-gray-600">{r.cuisine} - {r.location}</p>
                              {r.affiliateLink && (
                                <a href={r.affiliateLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                                  Order / Visit
                                </a>
                              )}
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
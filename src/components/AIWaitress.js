import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { fetchRestaurants, fetchMenu } from '../services/mockBackend';

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

    // Base prompts that work anytime
    const basePrompts = [
      "Show me all restaurants",
      "What restaurants are available?",
      "Show me Sakura Sushi menu",
      "Find Italian restaurants nearby",
      "Show me Mario's menu",
      "Any vegetarian options?",
      "Discover restaurants in downtown",
      "Help me with allergies",
      "What's trending today?"
    ];

    // Mix time-based and base prompts
    return [...timeBasedPrompts.slice(0, 2), ...basePrompts.slice(0, 3)];
  };

  const quickQuestions = getSmartPrompts();

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
      // Check if user is asking about restaurants or menus
      const message = messageToProcess.toLowerCase();
      
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
      }
      
      // Check if user is asking about menu
      if (message.includes('menu') || message.includes('food') || message.includes('dish')) {
        // Check if they mentioned a specific restaurant
        if (message.includes('mario') || message.includes('italian kitchen')) {
          try {
            const menu = await fetchMenu(1);
            let aiResponse = `Here's the menu for ${menu.restaurantName}:\n\n`;
            menu.menu.forEach(item => {
              aiResponse += `🍽️ **${item.name}** - $${item.price}\n   ${item.description}\n   Category: ${item.category}\n\n`;
            });
            
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
            console.error('Failed to fetch menu:', error);
          }
        } else if (message.includes('sakura') || message.includes('sushi') || message.includes('japanese')) {
          try {
            const menu = await fetchMenu(5);
            let aiResponse = `Here's the menu for ${menu.restaurantName}:\n\n`;
            menu.menu.forEach(item => {
              aiResponse += `🍽️ **${item.name}** - $${item.price}\n   ${item.description}\n   Category: ${item.category}\n\n`;
            });
            
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
            console.error('Failed to fetch menu:', error);
          }
        }
      }

      // Get user profile for context
      const userProfile = await apiService.getUserProfile();
      
      // Send message to AI service with context
      const aiResponse = await apiService.sendAIMessage(messageToProcess, {
        userProfile,
        conversationHistory: messages.slice(-5) // Last 5 messages for context
      });
      
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Check if this response includes restaurant recommendations and offer discovery option
      if (aiResponse.includes('restaurants') && (aiResponse.includes('found') || aiResponse.includes('search'))) {
        setTimeout(() => {
          const discoveryMessage = {
            id: messages.length + 3,
            type: 'ai',
            content: "Would you like to explore these restaurants in more detail? I can show you a full list with photos, reviews, and menus!",
            timestamp: new Date().toLocaleTimeString(),
            actions: [
              {
                label: "🔍 Discover Restaurants",
                action: () => navigate('/discover')
              },
              {
                label: "📋 Browse Current Menu",
                action: () => navigate('/customer')
              }
            ]
          };
          setMessages(prev => [...prev, discoveryMessage]);
        }, 1000);
      }
      
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
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
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
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const aiResponses = {
    greeting: [
      "Hello! I'm Sofia, your AI waitress. How can I assist you today?",
      "Hi there! I'm here to help you with your dining experience. What would you like to know?",
      "Welcome! I'm Sofia, your intelligent dining assistant. How may I help you?"
    ],
    menu: [
      "Our menu features amazing dishes from talented chefs around the world. We have appetizers like Caesar Salad and Lobster Bisque, main courses including Grilled Salmon and Beef Wellington, and delicious desserts like Chocolate Soufflé. What type of dish interests you?",
      "We offer a variety of cuisines! Our chefs specialize in everything from Italian pizzas to French soufflés. Would you like recommendations based on your preferences?",
      "Our menu is crafted by expert chefs and changes regularly. Today we have some amazing seafood options, hearty meat dishes, and vegetarian choices. What are you in the mood for?"
    ],
    recommendations: [
      "Based on popular choices, I'd recommend the Grilled Salmon by Chef Mario - it has a 4.8-star rating! Or if you're feeling adventurous, try the Beef Wellington by Chef Isabella.",
      "For a lighter option, the Caesar Salad is excellent. If you want something indulgent, the Lobster Bisque is divine! What's your preference for tonight?",
      "The Margherita Pizza by Chef Antonio is perfect for sharing, and our Chocolate Soufflé is the perfect way to end your meal. Would you like me to add these to your order?"
    ],
    dietary: [
      "We cater to all dietary needs! We have vegetarian options like our Margherita Pizza, and our chefs can accommodate gluten-free and other special requirements. What dietary needs should I consider?",
      "Our chefs are happy to modify dishes for allergies or dietary restrictions. Just let me know what you need to avoid, and I'll suggest the perfect options for you!",
      "We take dietary requirements seriously. Our Caesar Salad can be made vegan, and we have several gluten-free options. What would work best for you?"
    ],
    ordering: [
      "I'd be happy to help you place an order! You can browse our menu and add items to your cart, or tell me what you'd like and I'll guide you through the process.",
      "To order, simply tell me what dishes interest you, and I'll add them to your cart. You can also specify any customizations or special requests.",
      "Let's get your order started! What dishes have caught your eye? I can also suggest perfect pairings if you'd like."
    ],
    chefs: [
      "Our chefs are amazing! Chef Mario specializes in seafood and Mediterranean cuisine, Chef Isabella is our French cuisine expert, Chef Pierre creates incredible desserts, and Chef Antonio is our Italian master. Each brings unique expertise to our platform.",
      "We work with verified professional chefs who are passionate about their craft. You can see chef profiles and ratings for each dish. Is there a particular cuisine you're interested in?",
      "Our chefs love connecting with food lovers! They often share cooking tips and the inspiration behind their dishes. Would you like to know more about any specific chef?"
    ]
  };

  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Try to get user profile for personalized responses
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const hasProfile = Object.keys(userProfile).length > 0;
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      if (hasProfile && userProfile.name) {
        return `Hello ${userProfile.name}! I'm Sofia, your AI waitress. Based on your profile, I can give you personalized recommendations. How can I help you today?`;
      }
      return aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
    } else if (message.includes('menu') || message.includes('food') || message.includes('dish')) {
      if (hasProfile && userProfile.cuisinePreferences?.length > 0) {
        return `Great! I see you enjoy ${userProfile.cuisinePreferences.join(', ')} cuisine. Our menu has excellent options in those categories. We have ${userProfile.cuisinePreferences.includes('Italian') ? 'Margherita Pizza by Chef Antonio, ' : ''}${userProfile.cuisinePreferences.includes('French') ? 'Beef Wellington by Chef Isabella, ' : ''}${userProfile.cuisinePreferences.includes('Mediterranean') ? 'Grilled Salmon by Chef Mario, ' : ''}and many more. What sounds good to you?`;
      }
      return aiResponses.menu[Math.floor(Math.random() * aiResponses.menu.length)];
    } else if (message.includes('recommend') || message.includes('suggest') || message.includes('best')) {
      if (hasProfile) {
        let recommendations = [];
        
        // Budget-based recommendations
        if (userProfile.budgetRange === '$10-20') {
          recommendations.push('Caesar Salad ($15) and Chocolate Soufflé ($12)');
        } else if (userProfile.budgetRange === '$20-35') {
          recommendations.push('Grilled Salmon ($28) or Margherita Pizza ($22)');
        } else if (userProfile.budgetRange === '$35-50') {
          recommendations.push('Beef Wellington ($35) - a premium choice');
        }
        
        // Dietary restriction recommendations
        if (userProfile.dietaryRestrictions?.includes('Vegetarian')) {
          recommendations.push('our vegetarian Margherita Pizza');
        }
        if (userProfile.dietaryRestrictions?.includes('Gluten-Free')) {
          recommendations.push('our gluten-free Caesar Salad (can be made without croutons)');
        }
        
        // Goal-based recommendations
        if (userProfile.goals?.includes('Weight Loss')) {
          recommendations.push('the light and healthy Caesar Salad');
        }
        if (userProfile.goals?.includes('Heart Health')) {
          recommendations.push('our Grilled Salmon with omega-3 fatty acids');
        }
        
        if (recommendations.length > 0) {
          return `Based on your profile, I'd recommend ${recommendations.join(' or ')}. These align with your preferences and dietary goals!`;
        }
      }
      return aiResponses.recommendations[Math.floor(Math.random() * aiResponses.recommendations.length)];
    } else if (message.includes('vegetarian') || message.includes('vegan') || message.includes('gluten') || message.includes('allergy') || message.includes('dietary')) {
      if (hasProfile && userProfile.dietaryRestrictions?.length > 0) {
        return `I see from your profile that you follow a ${userProfile.dietaryRestrictions.join(', ')} diet. ${userProfile.allergies?.length > 0 ? `And I'll make sure to avoid ${userProfile.allergies.join(', ')}.` : ''} Let me suggest dishes that work perfectly for you!`;
      }
      return aiResponses.dietary[Math.floor(Math.random() * aiResponses.dietary.length)];
    } else if (message.includes('order') || message.includes('buy') || message.includes('cart')) {
      return aiResponses.ordering[Math.floor(Math.random() * aiResponses.ordering.length)];
    } else if (message.includes('chef') || message.includes('cook')) {
      return aiResponses.chefs[Math.floor(Math.random() * aiResponses.chefs.length)];
    } else if (message.includes('profile') || message.includes('preference')) {
      if (hasProfile) {
        return `I can see your profile! You enjoy ${userProfile.cuisinePreferences?.join(', ') || 'various cuisines'}, ${userProfile.dietaryRestrictions?.length > 0 ? `follow a ${userProfile.dietaryRestrictions.join(', ')} diet, ` : ''}and your budget is around ${userProfile.budgetRange || 'flexible'}. Would you like recommendations based on these preferences?`;
      } else {
        return "I don't see a profile set up for you yet. Would you like to set up your dining preferences? It helps me give you much better recommendations!";
      }
    } else {
      return "That's an interesting question! I'm here to help you with menu information, recommendations, dietary requirements, and placing orders. What would you like to know more about?";
    }
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
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: getAIResponse(inputMessage),
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What's popular today?",
    "Give me personalized recommendations",
    "Any vegetarian options?",
    "Show me my profile preferences",
    "Help me place an order"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="text-purple-600 hover:text-purple-700 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">🤖 AI Waitress - Sofia</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/customer')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Menu
              </button>
              <button 
                onClick={() => navigate('/chef')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                View Menu
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-purple-600 text-white p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">Sofia - AI Waitress</h3>
                <p className="text-purple-200 text-sm">Always here to help with your dining experience</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
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
          <div className="border-t p-4">
            <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Sofia anything about our menu, chefs, or dining experience..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIWaitress;
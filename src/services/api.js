// API Service Layer for FoodAI Backend Integration
import yelpService from './yelpService';
import menuApiService from './menuApiService';

class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.aifoodback.example.com';
    this.isBackendAvailable = false;
    this.yelpService = yelpService;
    this.menuApiService = menuApiService;
    this.checkBackendConnection();
  }

  async checkBackendConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        timeout: 5000
      });
      this.isBackendAvailable = response.ok;
    } catch (error) {
      console.log('Backend not available, using localStorage fallback');
      this.isBackendAvailable = false;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Profile API
  async getUserProfile() {
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('userProfile') || '{}');
    }
    
    try {
      return await this.request('/user/profile');
    } catch (error) {
      // Fallback to localStorage on error
      return JSON.parse(localStorage.getItem('userProfile') || '{}');
    }
  }

  async saveUserProfile(profile) {
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return profile;
    }

    try {
      const result = await this.request('/user/profile', {
        method: 'POST',
        body: profile,
      });
      // Also save to localStorage as backup
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return result;
    } catch (error) {
      // Fallback to localStorage on error
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return profile;
    }
  }

  // Menu Items API with enhanced integration
  async getMenuItems(restaurantId = null, useExternalApi = false) {
    // Try external menu APIs first if requested
    if (useExternalApi && restaurantId) {
      try {
        const menu = await this.menuApiService.getRestaurantMenu(restaurantId);
        if (menu && menu.categories) {
          return this.menuApiService.getAllMenuItems(menu);
        }
      } catch (error) {
        console.log('External menu API failed, falling back to backend/local menu');
      }
    }

    if (!this.isBackendAvailable) {
      // Fallback to hardcoded menu items
      return [
        { id: 1, name: 'Grilled Salmon', price: 28, description: 'Fresh Atlantic salmon with lemon herbs', category: 'Main Course', chef: 'Chef Mario', rating: 4.8, image: '🐟', allergens: ['fish'] },
        { id: 2, name: 'Caesar Salad', price: 15, description: 'Crisp romaine lettuce with parmesan and croutons', category: 'Appetizer', chef: 'Chef Mario', rating: 4.6, image: '🥗', allergens: ['dairy', 'gluten'] },
        { id: 3, name: 'Beef Wellington', price: 35, description: 'Tender beef wrapped in puff pastry with mushroom duxelles', category: 'Main Course', chef: 'Chef Isabella', rating: 4.9, image: '🥩', allergens: ['gluten', 'eggs'] },
        { id: 4, name: 'Chocolate Soufflé', price: 12, description: 'Warm chocolate soufflé with vanilla ice cream', category: 'Dessert', chef: 'Chef Pierre', rating: 4.7, image: '🍰', allergens: ['dairy', 'eggs', 'gluten'] },
        { id: 5, name: 'Lobster Bisque', price: 18, description: 'Rich and creamy lobster soup with a hint of brandy', category: 'Appetizer', chef: 'Chef Isabella', rating: 4.8, image: '🦞', allergens: ['shellfish', 'dairy'] },
        { id: 6, name: 'Margherita Pizza', price: 22, description: 'Traditional pizza with fresh mozzarella, tomatoes, and basil', category: 'Main Course', chef: 'Chef Antonio', rating: 4.5, image: '🍕', allergens: ['gluten', 'dairy'] },
      ];
    }

    try {
      return await this.request('/menu/items');
    } catch (error) {
      // Fallback to hardcoded menu items on error
      return [
        { id: 1, name: 'Grilled Salmon', price: 28, description: 'Fresh Atlantic salmon with lemon herbs', category: 'Main Course', chef: 'Chef Mario', rating: 4.8, image: '🐟', allergens: ['fish'] },
        { id: 2, name: 'Caesar Salad', price: 15, description: 'Crisp romaine lettuce with parmesan and croutons', category: 'Appetizer', chef: 'Chef Mario', rating: 4.6, image: '🥗', allergens: ['dairy', 'gluten'] },
        { id: 3, name: 'Beef Wellington', price: 35, description: 'Tender beef wrapped in puff pastry with mushroom duxelles', category: 'Main Course', chef: 'Chef Isabella', rating: 4.9, image: '🥩', allergens: ['gluten', 'eggs'] },
        { id: 4, name: 'Chocolate Soufflé', price: 12, description: 'Warm chocolate soufflé with vanilla ice cream', category: 'Dessert', chef: 'Chef Pierre', rating: 4.7, image: '🍰', allergens: ['dairy', 'eggs', 'gluten'] },
        { id: 5, name: 'Lobster Bisque', price: 18, description: 'Rich and creamy lobster soup with a hint of brandy', category: 'Appetizer', chef: 'Chef Isabella', rating: 4.8, image: '🦞', allergens: ['shellfish', 'dairy'] },
        { id: 6, name: 'Margherita Pizza', price: 22, description: 'Traditional pizza with fresh mozzarella, tomatoes, and basil', category: 'Main Course', chef: 'Chef Antonio', rating: 4.5, image: '🍕', allergens: ['gluten', 'dairy'] },
      ];
    }
  }

  // New Yelp integration methods
  async searchRestaurants(location, term = 'restaurants', limit = 20) {
    return await this.yelpService.searchBusinesses(location, term, limit);
  }

  async getRestaurantDetails(restaurantId) {
    return await this.yelpService.getBusinessDetails(restaurantId);
  }

  // New menu API integration methods
  async getRestaurantMenu(restaurantId, provider = 'chownow') {
    return await this.menuApiService.getRestaurantMenu(restaurantId, provider);
  }

  async searchMenuItems(restaurantId, searchTerm, provider = 'chownow') {
    const menu = await this.menuApiService.getRestaurantMenu(restaurantId, provider);
    return this.menuApiService.searchMenuItems(menu, searchTerm);
  }

  // Cart API
  async saveCart(cart) {
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      localStorage.setItem('currentCart', JSON.stringify(cart));
      return cart;
    }

    try {
      const result = await this.request('/cart', {
        method: 'POST',
        body: { cart },
      });
      // Also save to localStorage as backup
      localStorage.setItem('currentCart', JSON.stringify(cart));
      return result;
    } catch (error) {
      // Fallback to localStorage on error
      localStorage.setItem('currentCart', JSON.stringify(cart));
      return cart;
    }
  }

  async getCart() {
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      const savedCart = localStorage.getItem('currentCart');
      return savedCart ? JSON.parse(savedCart) : [];
    }

    try {
      const result = await this.request('/cart');
      return result.cart || [];
    } catch (error) {
      // Fallback to localStorage on error
      const savedCart = localStorage.getItem('currentCart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
  }

  async clearCart() {
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      localStorage.removeItem('currentCart');
      return true;
    }

    try {
      await this.request('/cart', { method: 'DELETE' });
      localStorage.removeItem('currentCart');
      return true;
    } catch (error) {
      // Fallback to localStorage on error
      localStorage.removeItem('currentCart');
      return true;
    }
  }

  // Orders API
  async placeOrder(orderData) {
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const newOrder = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        ...orderData,
      };
      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      return newOrder;
    }

    try {
      const result = await this.request('/orders', {
        method: 'POST',
        body: orderData,
      });
      // Also save to localStorage as backup
      const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = [result, ...existingOrders];
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      return result;
    } catch (error) {
      // Fallback to localStorage on error
      const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const newOrder = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        ...orderData,
      };
      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      return newOrder;
    }
  }

  async getOrderHistory() {
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('orderHistory') || '[]');
    }

    try {
      const result = await this.request('/orders/history');
      return result.orders || [];
    } catch (error) {
      // Fallback to localStorage on error
      return JSON.parse(localStorage.getItem('orderHistory') || '[]');
    }
  }

  async updateOrderRating(orderId, ratings) {
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((item, index) => ({
              ...item,
              rating: ratings[index] || item.rating
            })),
            rated: true
          };
        }
        return order;
      });
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      return updatedOrders.find(order => order.id === orderId);
    }

    try {
      const result = await this.request(`/orders/${orderId}/rating`, {
        method: 'PUT',
        body: { ratings },
      });
      // Also update localStorage as backup
      const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((item, index) => ({
              ...item,
              rating: ratings[index] || item.rating
            })),
            rated: true
          };
        }
        return order;
      });
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      return result;
    } catch (error) {
      // Fallback to localStorage on error
      const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const updatedOrders = orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((item, index) => ({
              ...item,
              rating: ratings[index] || item.rating
            })),
            rated: true
          };
        }
        return order;
      });
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      return updatedOrders.find(order => order.id === orderId);
    }
  }

  // AI Waitress API with enhanced restaurant discovery
  async sendAIMessage(message, context = {}) {
    if (!this.isBackendAvailable) {
      // Enhanced fallback with restaurant discovery
      return this.getEnhancedAIResponse(message, context);
    }

    try {
      const result = await this.request('/ai/chat', {
        method: 'POST',
        body: { message, context },
      });
      return result.response;
    } catch (error) {
      // Fallback to enhanced AI responses on error
      return this.getEnhancedAIResponse(message, context);
    }
  }

  async getEnhancedAIResponse(userMessage, context = {}) {
    const message = userMessage.toLowerCase();
    
    // Check if this is a restaurant discovery request
    if (this.isRestaurantDiscoveryRequest(message)) {
      return this.handleRestaurantDiscovery(userMessage, context);
    }

    // Fall back to local AI responses for other requests
    return this.getLocalAIResponse(userMessage, context);
  }

  isRestaurantDiscoveryRequest(message) {
    const restaurantKeywords = ['restaurant', 'place to eat', 'dining', 'eatery', 'cafe', 'bistro'];
    const locationKeywords = ['nearby', 'near me', 'around', 'location', 'area'];
    const cuisineKeywords = ['italian', 'chinese', 'mexican', 'thai', 'indian', 'french', 'japanese', 'korean', 'pizza', 'sushi', 'burger'];
    const discoveryKeywords = ['find', 'search', 'looking for', 'recommend', 'suggest', 'discover'];

    const hasRestaurantKeyword = restaurantKeywords.some(keyword => message.includes(keyword));
    const hasLocationKeyword = locationKeywords.some(keyword => message.includes(keyword));
    const hasCuisineKeyword = cuisineKeywords.some(keyword => message.includes(keyword));
    const hasDiscoveryKeyword = discoveryKeywords.some(keyword => message.includes(keyword));

    return ((hasRestaurantKeyword || hasCuisineKeyword) && (hasLocationKeyword || hasDiscoveryKeyword));
  }

  async handleRestaurantDiscovery(userMessage, context = {}) {
    try {
      // Extract location and cuisine from the message
      const location = this.extractLocation(userMessage) || 'downtown';
      const cuisine = this.extractCuisine(userMessage) || 'restaurants';

      // Search for restaurants using Yelp service
      const restaurants = await this.searchRestaurants(location, cuisine, 5);

      if (restaurants && restaurants.length > 0) {
        const restaurantList = restaurants.map((restaurant, index) => 
          `${index + 1}. **${restaurant.name}** (${restaurant.rating}⭐) - ${restaurant.categories?.join(', ') || cuisine}\n   📍 ${restaurant.location?.address1 || 'Address not available'}\n   💰 ${restaurant.price || 'Price not available'}`
        ).join('\n\n');

        return `Great! I found some excellent ${cuisine} restaurants ${location}:\n\n${restaurantList}\n\nWould you like to see the menu for any of these restaurants? Just let me know which one interests you!`;
      } else {
        return `I'm sorry, I couldn't find specific restaurants in that area right now. However, I can show you our current menu with some amazing dishes! We have Italian options like Margherita Pizza, fresh Grilled Salmon, and more. Would you like to browse our available dishes?`;
      }
    } catch (error) {
      console.error('Restaurant discovery failed:', error);
      return `I'd love to help you find restaurants! While I search for options, would you like to browse our current menu? We have some fantastic dishes available right now.`;
    }
  }

  extractLocation(message) {
    // Simple location extraction - in a real app this would be more sophisticated
    const locationPatterns = [
      /nearby|near me|around/i,
      /in ([a-zA-Z\s]+)/i,
      /at ([a-zA-Z\s]+)/i,
      /downtown|city center|uptown/i
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[1]) return match[1].trim();
        return 'nearby';
      }
    }
    return null;
  }

  extractCuisine(message) {
    const cuisines = {
      'italian': ['italian', 'pizza', 'pasta', 'lasagna'],
      'chinese': ['chinese', 'dim sum', 'wok'],
      'mexican': ['mexican', 'tacos', 'burrito', 'quesadilla'],
      'thai': ['thai', 'pad thai', 'curry'],
      'indian': ['indian', 'curry', 'naan', 'biryani'],
      'japanese': ['japanese', 'sushi', 'ramen', 'tempura'],
      'french': ['french', 'bistro', 'croissant'],
      'american': ['burger', 'barbecue', 'bbq', 'steak'],
      'korean': ['korean', 'kimchi', 'bulgogi']
    };

    for (const [cuisine, keywords] of Object.entries(cuisines)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return cuisine;
      }
    }
    
    return 'restaurants';
  }

  getLocalAIResponse(userMessage, context = {}) {
    const message = userMessage.toLowerCase();
    const userProfile = context.userProfile || {};
    const hasProfile = Object.keys(userProfile).length > 0;
    
    const aiResponses = {
      greeting: [
        "Hello! I'm Sofia, your AI waitress. I'm here to help you discover amazing dishes and make your dining experience perfect!",
        "Hi there! Welcome to FoodAI! I'm Sofia, and I'd love to help you find the perfect meal today.",
        "Welcome! I'm Sofia, your personal AI assistant. Ready to explore our delicious menu together?"
      ],
      menu: [
        "Our menu features amazing dishes from talented chefs! We have appetizers, main courses, and desserts. What type of cuisine are you in the mood for?",
        "Today's menu includes fresh salmon, beef wellington, lobster bisque, and more! Would you like me to recommend something based on your preferences?",
        "We have incredible options from our verified chefs. Are you looking for something specific, or would you like me to suggest some popular dishes?"
      ],
      dietary: [
        "I'd be happy to help with dietary requirements! We can filter dishes by vegetarian, vegan, gluten-free, and many other options. What are your specific needs?",
        "Absolutely! Our chefs are experienced with various dietary restrictions. Tell me about your dietary preferences and I'll find perfect matches.",
        "No problem at all! Whether you're vegetarian, have allergies, or follow a specific diet, we have delicious options for you."
      ],
      ordering: [
        "I can help you add items to your cart and walk you through the ordering process! What dishes caught your eye?",
        "Ready to order? I can help you add items to your cart, adjust quantities, and even suggest perfect pairings!",
        "Let's get your order started! Browse the menu and I'll help you with quantities, modifications, or any questions."
      ],
      chefs: [
        "Our chefs are amazing! Each one specializes in different cuisines and brings unique flair to their dishes. Would you like to know about a specific chef?",
        "We work with verified chefs who are passionate about their craft! They're always happy to accommodate special requests when possible.",
        "Our chefs love connecting with food lovers! They often share cooking tips and the inspiration behind their dishes. Would you like to know more about any specific chef?"
      ],
      restaurants: [
        "I'd love to help you discover amazing restaurants! I can search for places based on your location and preferences. What type of cuisine or location are you interested in?",
        "Great! I can help you find fantastic restaurants nearby. What kind of food are you craving, and where are you located?",
        "Perfect! Let me help you discover some wonderful dining options. Tell me your location and what type of restaurant you're looking for!"
      ],
      discovery: [
        "I can help you explore restaurants and their menus! Once you find a restaurant you like, I can show you their full menu and help you decide what to order.",
        "Let's start your culinary journey! I can search for restaurants, show you their menus, and guide you through ordering from your favorites.",
        "I'm here to make restaurant discovery easy! From finding the perfect spot to browsing menus and placing orders, I've got you covered."
      ]
    };

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      if (hasProfile && userProfile.name) {
        return `Hello ${userProfile.name}! I'm Sofia, your AI waitress. Based on your profile, I can give you personalized recommendations. How can I help you today?`;
      }
      return aiResponses.greeting[Math.floor(Math.random() * aiResponses.greeting.length)];
    } else if (message.includes('restaurant') || message.includes('place to eat') || message.includes('dining') || (message.includes('find') && (message.includes('italian') || message.includes('chinese') || message.includes('mexican') || message.includes('nearby') || message.includes('location')))) {
      return aiResponses.restaurants[Math.floor(Math.random() * aiResponses.restaurants.length)];
    } else if (message.includes('discover') || message.includes('explore') || message.includes('browse') || message.includes('search')) {
      return aiResponses.discovery[Math.floor(Math.random() * aiResponses.discovery.length)];
    } else if (message.includes('menu') || message.includes('food') || message.includes('dish')) {
      return aiResponses.menu[Math.floor(Math.random() * aiResponses.menu.length)];
    } else if (message.includes('allerg') || message.includes('diet') || message.includes('vegetarian') || message.includes('vegan')) {
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
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
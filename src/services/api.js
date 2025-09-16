// API Service Layer for FoodAI Backend Integration
import yelpService from './yelpService';
import googlePlacesService from './googlePlacesService';
import menuApiService from './menuApiService';

class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://api.aifoodback.example.com';
    this.isBackendAvailable = undefined; // Will be set by checkBackendConnection
    this.yelpService = yelpService;
    this.googlePlacesService = googlePlacesService;
    this.menuApiService = menuApiService;
    
    // Start backend connection check (async, won't block constructor)
    this.checkBackendConnection().catch(error => {
      console.error('Initial backend connection check failed:', error);
      this.isBackendAvailable = false;
    });
  }

  async checkBackendConnection() {
    try {
      // Create a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      this.isBackendAvailable = response.ok;
      console.log('Backend connection check:', response.ok ? 'Connected' : 'Failed');
    } catch (error) {
      console.log('Backend not available, using localStorage fallback:', error.message);
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
      console.log('Making API request to:', url);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error(`API request failed - Status: ${response.status}, URL: ${url}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('API request successful:', url);
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Profile API
  async getUserProfile() {
    // Ensure backend availability is checked before making requests
    if (this.isBackendAvailable === undefined) {
      await this.checkBackendConnection();
    }
    
    if (!this.isBackendAvailable) {
      // Fallback to localStorage
      console.log('Using localStorage fallback for user profile');
      return JSON.parse(localStorage.getItem('userProfile') || '{}');
    }
    
    try {
      console.log('Fetching user profile from backend:', `${this.baseUrl}/user/profile`);
      return await this.request('/user/profile');
    } catch (error) {
      console.log('Backend request failed, falling back to localStorage:', error.message);
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

  // Restaurant Aggregator - Get meals filtered by user preferences
  async getMealsFiltered(preferences = {}) {
    const { cuisine, diet, maxPrice, category, allergens } = preferences;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (cuisine) params.append('cuisine', cuisine);
    if (diet) params.append('diet', diet);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (category) params.append('category', category);
    if (allergens) {
      if (Array.isArray(allergens)) {
        allergens.forEach(allergen => params.append('allergens', allergen));
      } else {
        params.append('allergens', allergens);
      }
    }

    try {
      const response = await this.request(`/meals?${params.toString()}`);
      return response.meals || [];
    } catch (error) {
      console.log('Failed to get filtered meals from backend, using fallback');
      return this.getFallbackMeals(preferences);
    }
  }

  // Get all available meals (backward compatibility)
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

    try {
      // Use the new meals endpoint for all available meals
      const response = await this.request('/meals');
      return response.meals || [];
    } catch (error) {
      console.log('Backend not available, using fallback menu');
      return this.getFallbackMeals();
    }
  }

  // Fallback menu for when backend is not available
  getFallbackMeals(preferences = {}) {
    const fallbackMeals = [
      { id: 1, name: 'Grilled Salmon', price: 28, description: 'Fresh Atlantic salmon with lemon herbs', category: 'Main Course', chef: 'Chef Mario', rating: 4.8, image: '🐟', allergens: ['fish'], cuisine: 'Italian', diet: 'pescatarian', restaurant_name: "Chef Mario's Italian Kitchen" },
      { id: 2, name: 'Caesar Salad', price: 15, description: 'Crisp romaine lettuce with parmesan and croutons', category: 'Appetizer', chef: 'Chef Mario', rating: 4.6, image: '🥗', allergens: ['dairy', 'gluten'], cuisine: 'Italian', diet: 'vegetarian', restaurant_name: "Chef Mario's Italian Kitchen" },
      { id: 3, name: 'Beef Wellington', price: 35, description: 'Tender beef wrapped in puff pastry with mushroom duxelles', category: 'Main Course', chef: 'Chef Isabella', rating: 4.9, image: '🥩', allergens: ['gluten', 'eggs'], cuisine: 'French', diet: 'regular', restaurant_name: "Isabella's Fine Dining" },
      { id: 4, name: 'Chocolate Soufflé', price: 12, description: 'Warm chocolate soufflé with vanilla ice cream', category: 'Dessert', chef: 'Chef Pierre', rating: 4.7, image: '🍰', allergens: ['dairy', 'eggs', 'gluten'], cuisine: 'French', diet: 'vegetarian', restaurant_name: "Isabella's Fine Dining" },
      { id: 5, name: 'Quinoa Buddha Bowl', price: 18, description: 'Nutritious quinoa bowl with fresh vegetables and tahini dressing', category: 'Main Course', chef: 'Chef Sarah', rating: 4.4, image: '🥙', allergens: ['sesame'], cuisine: 'Vegetarian', diet: 'vegan', restaurant_name: "Garden Fresh Vegetarian" },
      { id: 6, name: 'Margherita Pizza', price: 22, description: 'Traditional pizza with fresh mozzarella, tomatoes, and basil', category: 'Main Course', chef: 'Chef Antonio', rating: 4.5, image: '🍕', allergens: ['gluten', 'dairy'], cuisine: 'Italian', diet: 'vegetarian', restaurant_name: "Antonio's Pizza Place" },
    ];

    // Apply simple client-side filtering if backend is not available
    const { cuisine, diet, maxPrice, category, allergens } = preferences;
    
    return fallbackMeals.filter(meal => {
      if (cuisine && meal.cuisine.toLowerCase() !== cuisine.toLowerCase()) return false;
      if (diet && meal.diet.toLowerCase() !== diet.toLowerCase()) return false;
      if (maxPrice && meal.price > parseFloat(maxPrice)) return false;
      if (category && category !== 'All' && meal.category !== category) return false;
      if (allergens) {
        const allergenList = Array.isArray(allergens) ? allergens : [allergens];
        const hasAllergen = allergenList.some(allergen => 
          meal.allergens.includes(allergen.toLowerCase())
        );
        if (hasAllergen) return false;
      }
      return true;
    });
  }

  // Restaurant Aggregator - Get partner restaurants
  async getPartnerRestaurants() {
    try {
      return await this.request('/restaurants');
    } catch (error) {
      console.log('Failed to get partner restaurants, using fallback');
      return [
        { id: 1, name: "Chef Mario's Italian Kitchen", cuisine: "Italian", location: "Downtown", partnership_type: "direct" },
        { id: 2, name: "Isabella's Fine Dining", cuisine: "French", location: "Uptown", partnership_type: "direct" },
        { id: 3, name: "Antonio's Pizza Place", cuisine: "Italian", location: "Midtown", partnership_type: "direct" },
        { id: 4, name: "Garden Fresh Vegetarian", cuisine: "Vegetarian", location: "Downtown", partnership_type: "direct" },
        { id: 5, name: "Sakura Japanese Cuisine", cuisine: "Japanese", location: "Westside", partnership_type: "direct" }
      ];
    }
  }

  async getPartnerRestaurantDetails(restaurantId) {
    try {
      return await this.request(`/restaurants/${restaurantId}`);
    } catch (error) {
      console.log('Failed to get restaurant details, using fallback');
      return null;
    }
  }

  // Restaurant Discovery API - Enhanced with multiple providers
  async searchRestaurants(location, term = 'restaurants', limit = 20, provider = 'auto') {
    // Auto-select provider based on availability
    if (provider === 'auto') {
      if (this.googlePlacesService.isConfigured()) {
        provider = 'google';
      } else if (this.yelpService.isConfigured()) {
        provider = 'yelp';
      } else {
        provider = 'fallback';
      }
    }

    try {
      let results = [];
      
      switch (provider) {
        case 'google':
          results = await this.googlePlacesService.searchRestaurants(location, term);
          break;
        case 'yelp':
          results = await this.yelpService.searchBusinesses(location, term, limit);
          break;
        case 'both':
          // Get results from both services and merge them
          const [googleResults, yelpResults] = await Promise.allSettled([
            this.googlePlacesService.searchRestaurants(location, term),
            this.yelpService.searchBusinesses(location, term, limit)
          ]);
          
          results = [
            ...(googleResults.status === 'fulfilled' ? googleResults.value : []),
            ...(yelpResults.status === 'fulfilled' ? yelpResults.value : [])
          ];
          
          // Remove duplicates based on name and location
          results = this.deduplicateRestaurants(results);
          break;
        default:
          // Fallback to combined fallback data
          results = [
            ...this.googlePlacesService.getFallbackRestaurants(location, term),
            ...this.yelpService.getFallbackRestaurants()
          ];
      }

      // Limit results if specified
      if (limit && results.length > limit) {
        results = results.slice(0, limit);
      }

      return results;
    } catch (error) {
      console.error('Restaurant search failed:', error);
      // Return combined fallback data on error
      return [
        ...this.googlePlacesService.getFallbackRestaurants(location, term),
        ...this.yelpService.getFallbackRestaurants()
      ].slice(0, limit || 20);
    }
  }

  async getRestaurantDetails(restaurantId, provider = 'auto') {
    // Auto-detect provider based on ID format or source
    if (provider === 'auto') {
      if (restaurantId.startsWith('google-') || restaurantId.includes('ChIJ')) {
        provider = 'google';
      } else {
        provider = 'yelp';
      }
    }

    try {
      switch (provider) {
        case 'google':
          return await this.googlePlacesService.getPlaceDetails(restaurantId);
        case 'yelp':
          return await this.yelpService.getBusinessDetails(restaurantId);
        default:
          // Try both services
          const googleResult = await this.googlePlacesService.getPlaceDetails(restaurantId);
          if (googleResult) return googleResult;
          
          return await this.yelpService.getBusinessDetails(restaurantId);
      }
    } catch (error) {
      console.error('Restaurant details fetch failed:', error);
      // Return fallback details
      return this.googlePlacesService.getFallbackRestaurantDetails(restaurantId) ||
             this.yelpService.getFallbackRestaurantDetails(restaurantId);
    }
  }

  // Helper method to remove duplicate restaurants from merged results
  deduplicateRestaurants(restaurants) {
    const seen = new Set();
    return restaurants.filter(restaurant => {
      const key = `${restaurant.name.toLowerCase()}-${restaurant.location?.city?.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // New menu API integration methods
  async getRestaurantMenu(restaurantId, provider = 'chownow') {
    return await this.menuApiService.getRestaurantMenu(restaurantId, provider);
  }

  async searchMenuItems(restaurantId, searchTerm, provider = 'chownow') {
    const menu = await this.menuApiService.getRestaurantMenu(restaurantId, provider);
    return this.menuApiService.searchMenuItems(menu, searchTerm);
  }

  // Meal Finder API - Filter meals by preferences
  async getMeals(params = {}) {
    const { cuisine, diet, maxPrice, category } = params;
    
    try {
      // Get all available menu items
      const allItems = await this.getMenuItems();
      
      // Filter items based on preferences
      let filteredItems = allItems.filter(item => {
        // Filter by cuisine (check if item name, description, chef specialty, or cuisine field matches)
        if (cuisine) {
          const cuisineMatch = 
            item.name.toLowerCase().includes(cuisine.toLowerCase()) ||
            item.description.toLowerCase().includes(cuisine.toLowerCase()) ||
            item.chef.toLowerCase().includes(cuisine.toLowerCase()) ||
            (item.cuisine && item.cuisine.toLowerCase() === cuisine.toLowerCase());
          if (!cuisineMatch) return false;
        }
        
        // Filter by dietary restrictions
        if (diet) {
          const dietLower = diet.toLowerCase();
          
          // Check if item is suitable for dietary restriction
          if (dietLower === 'vegan') {
            // Vegan items should not contain dairy, eggs, or meat-related allergens
            const nonVeganAllergens = ['dairy', 'eggs', 'fish', 'shellfish'];
            if (item.allergens && item.allergens.some(allergen => nonVeganAllergens.includes(allergen))) {
              return false;
            }
            // Also check description for meat/dairy keywords
            const meatKeywords = ['beef', 'chicken', 'fish', 'salmon', 'lobster', 'cheese', 'butter', 'cream'];
            if (meatKeywords.some(keyword => item.description.toLowerCase().includes(keyword))) {
              return false;
            }
          } else if (dietLower === 'vegetarian') {
            // Vegetarian items should not contain fish or meat
            const nonVegetarianAllergens = ['fish', 'shellfish'];
            if (item.allergens && item.allergens.some(allergen => nonVegetarianAllergens.includes(allergen))) {
              return false;
            }
            // Check description for meat/fish keywords
            const meatKeywords = ['beef', 'chicken', 'fish', 'salmon', 'lobster'];
            if (meatKeywords.some(keyword => item.description.toLowerCase().includes(keyword))) {
              return false;
            }
          } else if (dietLower === 'gluten-free') {
            // Gluten-free items should not contain gluten
            if (item.allergens && item.allergens.includes('gluten')) {
              return false;
            }
          }
        }
        
        // Filter by maximum price
        if (maxPrice && item.price > parseFloat(maxPrice)) {
          return false;
        }
        
        // Filter by category if specified
        if (category && item.category.toLowerCase() !== category.toLowerCase()) {
          return false;
        }
        
        return true;
      });
      
      // Sort by rating (highest first) and price (lowest first for same rating)
      filteredItems.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        return a.price - b.price;
      });
      
      return {
        meals: filteredItems,
        total: filteredItems.length,
        filters: {
          cuisine,
          diet,
          maxPrice,
          category
        }
      };
    } catch (error) {
      console.error('Error filtering meals:', error);
      throw error;
    }
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
    const cuisineKeywords = ['italian', 'chinese', 'mexican', 'thai', 'indian', 'french', 'japanese', 'korean', 'pizza', 'sushi', 'burger', 'tacos', 'burrito', 'quesadilla', 'noodles', 'pasta'];
    const discoveryKeywords = ['find', 'search', 'looking for', 'recommend', 'suggest', 'discover', 'show me', 'where can i'];
    const priceKeywords = ['under', 'below', 'less than', 'budget', 'cheap', 'affordable', '$'];

    const hasRestaurantKeyword = restaurantKeywords.some(keyword => message.includes(keyword));
    const hasLocationKeyword = locationKeywords.some(keyword => message.includes(keyword));
    const hasCuisineKeyword = cuisineKeywords.some(keyword => message.includes(keyword));
    const hasDiscoveryKeyword = discoveryKeywords.some(keyword => message.includes(keyword));
    const hasPriceKeyword = priceKeywords.some(keyword => message.includes(keyword));

    // Enhanced logic to catch more restaurant discovery requests
    return (hasDiscoveryKeyword && (hasCuisineKeyword || hasLocationKeyword || hasRestaurantKeyword || hasPriceKeyword)) ||
           (hasCuisineKeyword && (hasLocationKeyword || hasDiscoveryKeyword)) ||
           (hasRestaurantKeyword && (hasLocationKeyword || hasDiscoveryKeyword));
  }

  // Enhanced restaurant discovery for AI responses
  async handleRestaurantDiscovery(userMessage, context = {}) {
    try {
      // Extract location, cuisine, and price from the message
      const location = this.extractLocation(userMessage) || 'downtown';
      const cuisine = this.extractCuisine(userMessage) || 'restaurants';
      const maxPrice = this.extractPrice(userMessage);

      // Use enhanced search with multiple providers
      const restaurants = await this.searchRestaurants(location, cuisine, 5, 'both');

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
          const restaurantList = filteredRestaurants.map((restaurant, index) => 
            `${index + 1}. **${restaurant.name}** (${restaurant.rating}⭐) - ${restaurant.categories?.join(', ') || cuisine}\n   📍 ${restaurant.location?.address1 || 'Address not available'}\n   💰 ${restaurant.price || 'Price not available'} ${restaurant.is_closed === false ? '🟢 Open' : restaurant.is_closed === true ? '🔴 Closed' : '❓ Hours unknown'}\n   🚗 ${this.getServiceIcons(restaurant)}${restaurant.source === 'google_places' ? ' 🅶' : restaurant.source === 'yelp' ? ' 🅱' : ''}`
          ).join('\n\n');

          const priceNote = maxPrice ? ` under $${maxPrice}` : '';
          return `Great! I found ${filteredRestaurants.length} excellent ${cuisine} restaurant${filteredRestaurants.length > 1 ? 's' : ''}${priceNote} ${location}:\n\n${restaurantList}\n\n${filteredRestaurants.some(r => r.source === 'google_places') ? '🅶 = Google Places' : ''}${filteredRestaurants.some(r => r.source === 'yelp') ? (filteredRestaurants.some(r => r.source === 'google_places') ? ' | ' : '') + '🅱 = Yelp' : ''}\n\nWould you like to see the menu for any of these restaurants? Just let me know which one interests you!`;
        } else {
          return `I found some ${cuisine} restaurants ${location}, but none within your budget of $${maxPrice}. Would you like to:\n1. Increase your budget range\n2. Browse our current menu for affordable options\n3. Try a different cuisine type`;
        }
      } else {
        return `I'm sorry, I couldn't find specific restaurants in that area right now. However, I can show you our current menu with some amazing dishes! We have Italian options like Margherita Pizza, fresh Grilled Salmon, and more. Would you like to browse our available dishes?`;
      }
    } catch (error) {
      console.error('Restaurant discovery failed:', error);
      return `I'd love to help you find restaurants! While I search for options, would you like to browse our current menu? We have some fantastic dishes available right now.`;
    }
  }

  getServiceIcons(restaurant) {
    // Generate service type icons based on restaurant data
    const services = [];
    
    // Most restaurants support these, so we'll show them unless specifically noted otherwise
    services.push('🍽️ Dine-in');
    
    if (restaurant.phone || restaurant.display_phone) {
      services.push('📱 Pickup');
    }
    
    // Assume delivery is available for most restaurants
    services.push('🚚 Delivery');
    
    return services.join(' ');
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

  extractPrice(message) {
    // Extract price constraints from natural language
    const pricePatterns = [
      /under\s*\$?(\d+)/i,
      /below\s*\$?(\d+)/i,
      /less\s+than\s*\$?(\d+)/i,
      /\$(\d+)\s*or\s+less/i,
      /maximum\s*\$?(\d+)/i,
      /max\s*\$?(\d+)/i,
      /budget\s*\$?(\d+)/i
    ];

    for (const pattern of pricePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return parseFloat(match[1]);
      }
    }
    return null;
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
    } else if (message.includes('find') || message.includes('recommend') || message.includes('suggest') || message.includes('perfect')) {
      if (hasProfile) {
        return `Based on your preferences for ${userProfile.cuisinePreferences?.join(', ') || 'various cuisines'} ${userProfile.dietaryRestrictions?.length > 0 ? `and ${userProfile.dietaryRestrictions.join(', ')} diet` : ''}, I'd be happy to find perfect meals for you! Try our Meal Finder feature where I can filter dishes by your exact preferences including cuisine, dietary needs, and budget. Would you like me to guide you there?`;
      } else {
        return "I'd love to recommend perfect meals for you! Our Meal Finder feature lets you specify your cuisine preferences, dietary restrictions, and budget to find dishes tailored just for you. You can also set up your profile first for even better personalized recommendations!";
      }
    } else if (message.includes('meal finder') || message.includes('filter') || message.includes('search')) {
      return "Great choice! The Meal Finder is perfect for discovering dishes that match your exact preferences. You can filter by cuisine type (Italian, Asian, etc.), dietary needs (vegan, vegetarian, gluten-free), budget range, and meal type. I'll provide personalized recommendations based on your selections. Ready to find your perfect meal?";
    } else {
      return "That's an interesting question! I'm here to help you with menu information, recommendations, dietary requirements, and placing orders. What would you like to know more about?";
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
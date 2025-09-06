// Menu API Service for ChowNow and OpenMenu Integration
import axios from 'axios';

class MenuApiService {
  constructor() {
    this.chowNowApiKey = process.env.REACT_APP_CHOWNOW_API_KEY;
    this.openMenuApiKey = process.env.REACT_APP_OPENMENU_API_KEY;
    this.chowNowBaseUrl = 'https://api.chownow.com/v1';
    this.openMenuBaseUrl = 'https://api.openmenu.com/v1';
  }

  async getRestaurantMenu(restaurantId, provider = 'chownow') {
    try {
      if (provider === 'chownow' && this.chowNowApiKey) {
        return await this.getChowNowMenu(restaurantId);
      } else if (provider === 'openmenu' && this.openMenuApiKey) {
        return await this.getOpenMenu(restaurantId);
      } else {
        console.warn(`${provider} API not configured, using fallback menu`);
        return this.getFallbackMenu(restaurantId);
      }
    } catch (error) {
      console.error(`Menu API request failed for ${provider}:`, error);
      return this.getFallbackMenu(restaurantId);
    }
  }

  async getChowNowMenu(restaurantId) {
    try {
      const response = await axios.get(`${this.chowNowBaseUrl}/restaurants/${restaurantId}/menu`, {
        headers: {
          'Authorization': `Bearer ${this.chowNowApiKey}`,
        },
      });

      return this.formatChowNowMenu(response.data);
    } catch (error) {
      console.error('ChowNow API error:', error);
      throw error;
    }
  }

  async getOpenMenu(restaurantId) {
    try {
      const response = await axios.get(`${this.openMenuBaseUrl}/restaurant/${restaurantId}/menu`, {
        headers: {
          'Authorization': `Bearer ${this.openMenuApiKey}`,
        },
      });

      return this.formatOpenMenu(response.data);
    } catch (error) {
      console.error('OpenMenu API error:', error);
      throw error;
    }
  }

  formatChowNowMenu(menuData) {
    return {
      restaurantId: menuData.restaurant_id,
      restaurantName: menuData.restaurant_name,
      categories: menuData.categories?.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        items: category.items?.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: category.name,
          image: item.image_url,
          allergens: item.allergens || [],
          nutritionInfo: item.nutrition || {},
          customizations: item.customizations || [],
          available: item.available !== false,
        })) || [],
      })) || [],
      lastUpdated: menuData.last_updated,
      provider: 'chownow',
    };
  }

  formatOpenMenu(menuData) {
    return {
      restaurantId: menuData.restaurant_id,
      restaurantName: menuData.restaurant_name,
      categories: menuData.menu?.categories?.map(category => ({
        id: category.category_id,
        name: category.category_name,
        description: category.category_description,
        items: category.menu_items?.map(item => ({
          id: item.menu_item_id,
          name: item.menu_item_name,
          description: item.menu_item_description,
          price: parseFloat(item.menu_item_price),
          category: category.category_name,
          image: item.menu_item_image,
          allergens: item.allergens || [],
          nutritionInfo: item.nutrition_info || {},
          available: item.available !== false,
        })) || [],
      })) || [],
      lastUpdated: menuData.last_updated,
      provider: 'openmenu',
    };
  }

  getFallbackMenu(restaurantId) {
    return {
      restaurantId: restaurantId || 'fallback-restaurant',
      restaurantName: 'Demo Restaurant',
      categories: [
        {
          id: 'appetizers',
          name: 'Appetizers',
          description: 'Start your meal with these delicious appetizers',
          items: [
            {
              id: 1,
              name: 'Caesar Salad',
              description: 'Crisp romaine lettuce with parmesan and croutons',
              price: 15,
              category: 'Appetizers',
              image: '🥗',
              allergens: ['dairy', 'gluten'],
              available: true,
            },
            {
              id: 2,
              name: 'Lobster Bisque',
              description: 'Rich and creamy lobster soup with a hint of brandy',
              price: 18,
              category: 'Appetizers',
              image: '🦞',
              allergens: ['shellfish', 'dairy'],
              available: true,
            },
          ],
        },
        {
          id: 'mains',
          name: 'Main Courses',
          description: 'Our signature main courses',
          items: [
            {
              id: 3,
              name: 'Grilled Salmon',
              description: 'Fresh Atlantic salmon with lemon herbs',
              price: 28,
              category: 'Main Courses',
              image: '🐟',
              allergens: ['fish'],
              available: true,
            },
            {
              id: 4,
              name: 'Beef Wellington',
              description: 'Tender beef wrapped in puff pastry with mushroom duxelles',
              price: 35,
              category: 'Main Courses',
              image: '🥩',
              allergens: ['gluten', 'dairy'],
              available: true,
            },
            {
              id: 5,
              name: 'Margherita Pizza',
              description: 'Traditional pizza with fresh mozzarella, tomatoes, and basil',
              price: 22,
              category: 'Main Courses',
              image: '🍕',
              allergens: ['gluten', 'dairy'],
              available: true,
            },
          ],
        },
        {
          id: 'desserts',
          name: 'Desserts',
          description: 'Sweet endings to your meal',
          items: [
            {
              id: 6,
              name: 'Chocolate Soufflé',
              description: 'Warm chocolate soufflé with vanilla ice cream',
              price: 12,
              category: 'Desserts',
              image: '🍰',
              allergens: ['dairy', 'eggs', 'gluten'],
              available: true,
            },
            {
              id: 7,
              name: 'Tiramisu',
              description: 'Classic Italian dessert with coffee-soaked ladyfingers',
              price: 10,
              category: 'Desserts',
              image: '🍰',
              allergens: ['dairy', 'eggs', 'gluten'],
              available: true,
            },
          ],
        },
      ],
      lastUpdated: new Date().toISOString(),
      provider: 'fallback',
    };
  }

  // Helper method to get all available items from a menu
  getAllMenuItems(menu) {
    const allItems = [];
    menu.categories?.forEach(category => {
      category.items?.forEach(item => {
        if (item.available) {
          allItems.push({
            ...item,
            chef: 'Chef Mario', // Default chef for API items
            rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
          });
        }
      });
    });
    return allItems;
  }

  // Method to search menu items by name or description
  searchMenuItems(menu, searchTerm) {
    const allItems = this.getAllMenuItems(menu);
    const lowercaseSearch = searchTerm.toLowerCase();
    
    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowercaseSearch) ||
      item.description.toLowerCase().includes(lowercaseSearch) ||
      item.category.toLowerCase().includes(lowercaseSearch)
    );
  }

  // Check if APIs are configured
  isChowNowConfigured() {
    return !!this.chowNowApiKey;
  }

  isOpenMenuConfigured() {
    return !!this.openMenuApiKey;
  }
}

// Create and export a singleton instance
const menuApiService = new MenuApiService();
export default menuApiService;
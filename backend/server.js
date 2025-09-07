// Restaurant Aggregator Backend - Direct Partnership System
// Handles meal filtering based on user preferences instead of relying on third-party platforms

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Sample restaurant and menu data - in production this would be a database
const restaurants = [
  {
    id: 1,
    name: "Chef Mario's Italian Kitchen",
    cuisine: "Italian",
    location: "Downtown",
    partnership_type: "direct",
    api_endpoint: null // Direct partnership, no external API needed
  },
  {
    id: 2,
    name: "Isabella's Fine Dining",
    cuisine: "French",
    location: "Uptown",
    partnership_type: "direct",
    api_endpoint: null
  },
  {
    id: 3,
    name: "Antonio's Pizza Place",
    cuisine: "Italian",
    location: "Midtown",
    partnership_type: "direct",
    api_endpoint: null
  },
  {
    id: 4,
    name: "Garden Fresh Vegetarian",
    cuisine: "Vegetarian",
    location: "Downtown",
    partnership_type: "direct",
    api_endpoint: null
  },
  {
    id: 5,
    name: "Sakura Japanese Cuisine",
    cuisine: "Japanese",
    location: "Westside",
    partnership_type: "direct",
    api_endpoint: null
  }
];

const meals = [
  {
    id: 1,
    restaurant_id: 1,
    name: 'Grilled Salmon',
    price: 28,
    description: 'Fresh Atlantic salmon with lemon herbs',
    category: 'Main Course',
    chef: 'Chef Mario',
    rating: 4.8,
    image: '🐟',
    allergens: ['fish'],
    cuisine: 'Italian',
    diet: 'pescatarian',
    available: true,
    restaurant_name: "Chef Mario's Italian Kitchen"
  },
  {
    id: 2,
    restaurant_id: 1,
    name: 'Caesar Salad',
    price: 15,
    description: 'Crisp romaine lettuce with parmesan and croutons',
    category: 'Appetizer',
    chef: 'Chef Mario',
    rating: 4.6,
    image: '🥗',
    allergens: ['dairy', 'gluten'],
    cuisine: 'Italian',
    diet: 'vegetarian',
    available: true,
    restaurant_name: "Chef Mario's Italian Kitchen"
  },
  {
    id: 3,
    restaurant_id: 2,
    name: 'Beef Wellington',
    price: 35,
    description: 'Tender beef wrapped in puff pastry with mushroom duxelles',
    category: 'Main Course',
    chef: 'Chef Isabella',
    rating: 4.9,
    image: '🥩',
    allergens: ['gluten', 'eggs'],
    cuisine: 'French',
    diet: 'regular',
    available: true,
    restaurant_name: "Isabella's Fine Dining"
  },
  {
    id: 4,
    restaurant_id: 2,
    name: 'Chocolate Soufflé',
    price: 12,
    description: 'Warm chocolate soufflé with vanilla ice cream',
    category: 'Dessert',
    chef: 'Chef Pierre',
    rating: 4.7,
    image: '🍰',
    allergens: ['dairy', 'eggs', 'gluten'],
    cuisine: 'French',
    diet: 'vegetarian',
    available: true,
    restaurant_name: "Isabella's Fine Dining"
  },
  {
    id: 5,
    restaurant_id: 3,
    name: 'Margherita Pizza',
    price: 22,
    description: 'Traditional pizza with fresh mozzarella, tomatoes, and basil',
    category: 'Main Course',
    chef: 'Chef Antonio',
    rating: 4.5,
    image: '🍕',
    allergens: ['gluten', 'dairy'],
    cuisine: 'Italian',
    diet: 'vegetarian',
    available: true,
    restaurant_name: "Antonio's Pizza Place"
  },
  {
    id: 6,
    restaurant_id: 4,
    name: 'Quinoa Buddha Bowl',
    price: 18,
    description: 'Nutritious quinoa bowl with fresh vegetables and tahini dressing',
    category: 'Main Course',
    chef: 'Chef Sarah',
    rating: 4.4,
    image: '🥙',
    allergens: ['sesame'],
    cuisine: 'Vegetarian',
    diet: 'vegan',
    available: true,
    restaurant_name: "Garden Fresh Vegetarian"
  },
  {
    id: 7,
    restaurant_id: 4,
    name: 'Avocado Toast',
    price: 12,
    description: 'Artisan bread topped with smashed avocado and hemp seeds',
    category: 'Appetizer',
    chef: 'Chef Sarah',
    rating: 4.2,
    image: '🥑',
    allergens: ['gluten'],
    cuisine: 'Vegetarian',
    diet: 'vegan',
    available: true,
    restaurant_name: "Garden Fresh Vegetarian"
  },
  {
    id: 8,
    restaurant_id: 5,
    name: 'Sushi Platter',
    price: 45,
    description: 'Assorted fresh sushi with wasabi and pickled ginger',
    category: 'Main Course',
    chef: 'Chef Tanaka',
    rating: 4.9,
    image: '🍣',
    allergens: ['fish'],
    cuisine: 'Japanese',
    diet: 'pescatarian',
    available: true,
    restaurant_name: "Sakura Japanese Cuisine"
  },
  {
    id: 9,
    restaurant_id: 5,
    name: 'Miso Soup',
    price: 8,
    description: 'Traditional Japanese soup with tofu and seaweed',
    category: 'Appetizer',
    chef: 'Chef Tanaka',
    rating: 4.3,
    image: '🍜',
    allergens: ['soy'],
    cuisine: 'Japanese',
    diet: 'vegan',
    available: true,
    restaurant_name: "Sakura Japanese Cuisine"
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Restaurant Aggregator API is running' });
});

// Main meals endpoint - filters meals based on user preferences
app.get('/api/meals', (req, res) => {
  try {
    const { cuisine, diet, maxPrice, category, allergens } = req.query;
    
    console.log('Filtering meals with preferences:', { cuisine, diet, maxPrice, category, allergens });
    
    // Filter meals based on query parameters
    let filteredMeals = meals.filter(meal => {
      // Only show available meals
      if (!meal.available) return false;
      
      // Filter by cuisine if specified
      if (cuisine && meal.cuisine.toLowerCase() !== cuisine.toLowerCase()) {
        return false;
      }
      
      // Filter by diet if specified
      if (diet && meal.diet.toLowerCase() !== diet.toLowerCase()) {
        return false;
      }
      
      // Filter by max price if specified
      if (maxPrice && meal.price > parseFloat(maxPrice)) {
        return false;
      }
      
      // Filter by category if specified
      if (category && category !== 'All' && meal.category !== category) {
        return false;
      }
      
      // Filter by allergens if specified (exclude meals containing specified allergens)
      if (allergens) {
        const allergenList = Array.isArray(allergens) ? allergens : [allergens];
        const hasAllergen = allergenList.some(allergen => 
          meal.allergens.includes(allergen.toLowerCase())
        );
        if (hasAllergen) return false;
      }
      
      return true;
    });
    
    // Sort by rating (highest first) and then by price (lowest first)
    filteredMeals.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return a.price - b.price;
    });
    
    res.json({
      meals: filteredMeals,
      total: filteredMeals.length,
      filters_applied: { cuisine, diet, maxPrice, category, allergens }
    });
    
  } catch (error) {
    console.error('Error filtering meals:', error);
    res.status(500).json({ 
      error: 'Failed to filter meals',
      details: error.message 
    });
  }
});

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
  res.json(restaurants);
});

// Get restaurant details
app.get('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;
  const restaurant = restaurants.find(r => r.id === parseInt(id));
  
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  
  // Get meals for this restaurant
  const restaurantMeals = meals.filter(meal => meal.restaurant_id === parseInt(id));
  
  res.json({
    ...restaurant,
    meals: restaurantMeals
  });
});

// Mock endpoints as specified in the problem statement
// Get all restaurants (without /api prefix for frontend mock functions)
app.get('/restaurants', (req, res) => {
  res.json(restaurants);
});

// Get restaurant menu (without /api prefix for frontend mock functions)
app.get('/restaurants/:id/menu', (req, res) => {
  const { id } = req.params;
  const restaurant = restaurants.find(r => r.id === parseInt(id));
  
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  
  // Get meals for this restaurant as menu items
  const menuItems = meals.filter(meal => meal.restaurant_id === parseInt(id));
  
  res.json({
    restaurantId: parseInt(id),
    restaurantName: restaurant.name,
    cuisine: restaurant.cuisine,
    location: restaurant.location,
    menu: menuItems
  });
});

// Search meals by text
app.get('/api/meals/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }
  
  const searchTerm = q.toLowerCase();
  const searchResults = meals.filter(meal => 
    meal.available && (
      meal.name.toLowerCase().includes(searchTerm) ||
      meal.description.toLowerCase().includes(searchTerm) ||
      meal.chef.toLowerCase().includes(searchTerm) ||
      meal.cuisine.toLowerCase().includes(searchTerm)
    )
  );
  
  res.json({
    meals: searchResults,
    total: searchResults.length,
    query: q
  });
});

// Fallback for menu items (for backward compatibility)
app.get('/api/menu/items', (req, res) => {
  // Return all available meals for backward compatibility
  const availableMeals = meals.filter(meal => meal.available);
  res.json(availableMeals);
});

// Start server
app.listen(PORT, () => {
  console.log(`🍽️  Restaurant Aggregator API running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/meals`);
  console.log(`🏪 Direct partnerships with ${restaurants.length} restaurants`);
  console.log(`🍽️  ${meals.filter(meal => meal.available).length} meals available`);
});

module.exports = app;
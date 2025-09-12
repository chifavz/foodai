// Restaurant Aggregator Backend - Direct Partnership System
// Handles meal filtering based on user preferences instead of relying on third-party platforms

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'foodai',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
let databaseConnected = false;
pool.connect()
  .then(() => {
    console.log('PostgreSQL connected');
    databaseConnected = true;
    initializeDatabase();
  })
  .catch(err => {
    console.log('PostgreSQL connection failed, using in-memory data:', err.message);
    databaseConnected = false;
  });

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

// Database initialization
async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cuisine VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        partnership_type VARCHAR(50) DEFAULT 'direct',
        api_endpoint VARCHAR(255)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER REFERENCES restaurants(id),
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        chef VARCHAR(255),
        rating DECIMAL(3,2),
        image VARCHAR(10),
        allergens TEXT[],
        cuisine VARCHAR(100),
        diet VARCHAR(50),
        available BOOLEAN DEFAULT true,
        restaurant_name VARCHAR(255)
      )
    `);

    // Check if data exists, if not, populate with sample data
    const restaurantCount = await pool.query('SELECT COUNT(*) FROM restaurants');
    if (parseInt(restaurantCount.rows[0].count) === 0) {
      await populateSampleData();
    }

    console.log('Database synced');
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}

async function populateSampleData() {
  try {
    // Insert restaurants
    for (const restaurant of restaurants) {
      await pool.query(
        'INSERT INTO restaurants (name, cuisine, location, partnership_type, api_endpoint) VALUES ($1, $2, $3, $4, $5)',
        [restaurant.name, restaurant.cuisine, restaurant.location, restaurant.partnership_type, restaurant.api_endpoint]
      );
    }

    // Insert meals
    for (const meal of meals) {
      await pool.query(
        'INSERT INTO meals (restaurant_id, name, price, description, category, chef, rating, image, allergens, cuisine, diet, available, restaurant_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        [meal.restaurant_id, meal.name, meal.price, meal.description, meal.category, meal.chef, meal.rating, meal.image, meal.allergens, meal.cuisine, meal.diet, meal.available, meal.restaurant_name]
      );
    }

    console.log('Sample data populated');
  } catch (error) {
    console.error('Failed to populate sample data:', error.message);
  }
}

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

// Authentication endpoints
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (databaseConnected) {
      // Try to find user in database
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        // In a real app, you'd hash and compare passwords
        if (password) { // Simple check for demo
          return res.json({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              preferences: {
                cuisineTypes: ['Italian', 'Asian'],
                dietaryRestrictions: [],
                servicePreference: 'dine-in'
              }
            },
            token: 'mock-token-' + user.id
          });
        }
      }
    }

    // Fallback for demo purposes
    if (email && password) {
      const mockUser = {
        id: 1,
        name: email.split('@')[0] || 'User',
        email: email,
        preferences: {
          cuisineTypes: ['Italian', 'Asian'],
          dietaryRestrictions: [],
          servicePreference: 'dine-in'
        }
      };
      return res.json({
        user: mockUser,
        token: 'mock-token'
      });
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (databaseConnected) {
      try {
        // Try to insert new user into database
        const result = await pool.query(
          'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
          [name, email, password] // In real app, hash the password
        );
        
        const user = result.rows[0];
        return res.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            preferences: {
              cuisineTypes: [],
              dietaryRestrictions: [],
              servicePreference: 'dine-in'
            }
          },
          token: 'mock-token-' + user.id
        });
      } catch (dbError) {
        if (dbError.code === '23505') { // Unique violation
          return res.status(409).json({ error: 'Email already exists' });
        }
        throw dbError;
      }
    }

    // Fallback for demo purposes
    const mockUser = {
      id: Date.now(),
      name: name,
      email: email,
      preferences: {
        cuisineTypes: [],
        dietaryRestrictions: [],
        servicePreference: 'dine-in'
      }
    };

    res.json({
      user: mockUser,
      token: 'mock-token'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
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

// User Profile endpoints
app.get('/api/user/profile', (req, res) => {
  // For now, return empty profile - frontend will use localStorage fallback
  // In a real implementation, this would fetch from database with user authentication
  res.json({});
});

app.post('/api/user/profile', (req, res) => {
  // For now, just return the posted profile
  // In a real implementation, this would save to database with user authentication
  const profile = req.body;
  res.json(profile);
});

// Cart endpoints
app.get('/api/cart', (req, res) => {
  // For now, return empty cart - frontend will use localStorage fallback
  // In a real implementation, this would fetch from database/session with user authentication
  res.json({ cart: [] });
});

app.post('/api/cart', (req, res) => {
  // For now, just return the posted cart
  // In a real implementation, this would save to database/session with user authentication
  const { cart } = req.body;
  res.json({ cart: cart || [] });
});

app.delete('/api/cart', (req, res) => {
  // For now, just return success
  // In a real implementation, this would clear the cart in database/session
  res.json({ success: true, cart: [] });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🍽️  Restaurant Aggregator API running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/meals`);
  
  if (databaseConnected) {
    try {
      const restaurantCount = await pool.query('SELECT COUNT(*) FROM restaurants');
      const mealCount = await pool.query('SELECT COUNT(*) FROM meals WHERE available = true');
      console.log(`🏪 Direct partnerships with ${restaurantCount.rows[0].count} restaurants`);
      console.log(`🍽️  ${mealCount.rows[0].count} meals available`);
    } catch (error) {
      console.log(`🏪 Direct partnerships with ${restaurants.length} restaurants`);
      console.log(`🍽️  ${meals.filter(meal => meal.available).length} meals available`);
    }
  } else {
    console.log(`🏪 Direct partnerships with ${restaurants.length} restaurants`);
    console.log(`🍽️  ${meals.filter(meal => meal.available).length} meals available`);
  }
});

module.exports = app;
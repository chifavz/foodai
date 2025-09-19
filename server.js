const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock restaurant data - matches the format expected by the frontend
const mockRestaurants = [
  {
    id: 'backend-restaurant-1',
    name: 'Downtown Grill & Bar',
    rating: 4.5,
    reviewCount: 342,
    categories: ['Restaurant', 'American', 'Bar'],
    location: {
      address1: '123 Main Street',
      city: 'Downtown',
      state: 'CA',
      zip_code: '90210',
    },
    phone: '+1-555-0123',
    image: '🍔',
    price: '$$',
    coordinates: {
      latitude: 34.0522,
      longitude: -118.2437,
    },
    url: 'https://example.com/downtown-grill',
    isOpenNow: true,
    source: 'backend_api',
  },
  {
    id: 'backend-restaurant-2',
    name: 'Sakura Japanese Cuisine',
    rating: 4.7,
    reviewCount: 156,
    categories: ['Restaurant', 'Japanese', 'Sushi'],
    location: {
      address1: '456 Oak Avenue',
      city: 'Downtown',
      state: 'CA',
      zip_code: '90210',
    },
    phone: '+1-555-0456',
    image: '🍣',
    price: '$$$',
    coordinates: {
      latitude: 34.0525,
      longitude: -118.2440,
    },
    url: 'https://example.com/sakura-japanese',
    isOpenNow: true,
    source: 'backend_api',
  },
  {
    id: 'backend-restaurant-3',
    name: 'Mediterranean Delights',
    rating: 4.3,
    reviewCount: 89,
    categories: ['Restaurant', 'Mediterranean', 'Healthy'],
    location: {
      address1: '789 Pine Street',
      city: 'Downtown',
      state: 'CA',
      zip_code: '90210',
    },
    phone: '+1-555-0789',
    image: '🥙',
    price: '$$',
    coordinates: {
      latitude: 34.0518,
      longitude: -118.2433,
    },
    url: 'https://example.com/mediterranean-delights',
    isOpenNow: false,
    source: 'backend_api',
  },
  {
    id: 'backend-restaurant-4',
    name: 'Authentic Tacos El Paso',
    rating: 4.6,
    reviewCount: 234,
    categories: ['Restaurant', 'Mexican', 'Casual'],
    location: {
      address1: '321 Elm Street',
      city: 'Downtown',
      state: 'CA',
      zip_code: '90210',
    },
    phone: '+1-555-0321',
    image: '🌮',
    price: '$',
    coordinates: {
      latitude: 34.0515,
      longitude: -118.2445,
    },
    url: 'https://example.com/tacos-el-paso',
    isOpenNow: true,
    source: 'backend_api',
  },
];

// Utility function to filter restaurants based on query parameters
function filterRestaurants(restaurants, location, query, radius) {
  let filtered = [...restaurants];
  
  // Filter by location (simple text matching)
  if (location && location.toLowerCase() !== 'downtown') {
    // For non-downtown locations, add some variation or return fewer results
    filtered = filtered.slice(0, 2);
  }
  
  // Filter by query/cuisine type
  if (query && query.toLowerCase() !== 'restaurants') {
    const queryLower = query.toLowerCase();
    filtered = filtered.filter(restaurant => 
      restaurant.name.toLowerCase().includes(queryLower) ||
      restaurant.categories.some(cat => cat.toLowerCase().includes(queryLower))
    );
  }
  
  // Apply radius filter (simplified - in real implementation would use actual distance calculation)
  if (radius && radius < 5000) {
    // For smaller radius, return fewer results
    filtered = filtered.slice(0, Math.max(1, Math.floor(filtered.length / 2)));
  }
  
  return filtered;
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FoodAI Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Restaurant search endpoint - this is the missing endpoint causing the 404
app.get('/api/restaurants', (req, res) => {
  try {
    const { location = 'downtown', query = 'restaurants', radius = 5000, limit = 20 } = req.query;
    
    console.log(`Restaurant search request: location=${location}, query=${query}, radius=${radius}`);
    
    // Filter restaurants based on query parameters
    let results = filterRestaurants(mockRestaurants, location, query, parseInt(radius));
    
    // Apply limit
    if (limit && parseInt(limit) > 0) {
      results = results.slice(0, parseInt(limit));
    }
    
    // Add some random variation to make it feel more dynamic
    const timestamp = Date.now();
    results = results.map(restaurant => ({
      ...restaurant,
      rating: Math.round((restaurant.rating + (Math.sin(timestamp) * 0.1)) * 10) / 10,
      isOpenNow: Math.random() > 0.2, // 80% chance of being open
    }));
    
    console.log(`Returning ${results.length} restaurants`);
    
    res.json({
      restaurants: results,
      total: results.length,
      query: {
        location,
        query,
        radius: parseInt(radius),
        limit: parseInt(limit)
      },
      source: 'backend_api'
    });
  } catch (error) {
    console.error('Error in restaurant search:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search restaurants'
    });
  }
});

// Get specific restaurant details
app.get('/api/restaurants/:id', (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = mockRestaurants.find(r => r.id === id);
    
    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found',
        message: `Restaurant with ID ${id} not found`
      });
    }
    
    // Add additional details for individual restaurant
    const detailedRestaurant = {
      ...restaurant,
      description: `Delicious ${restaurant.categories.join(', ')} cuisine in the heart of ${restaurant.location.city}.`,
      hours: [
        { day: 'Monday', open: '11:00 AM', close: '10:00 PM' },
        { day: 'Tuesday', open: '11:00 AM', close: '10:00 PM' },
        { day: 'Wednesday', open: '11:00 AM', close: '10:00 PM' },
        { day: 'Thursday', open: '11:00 AM', close: '10:00 PM' },
        { day: 'Friday', open: '11:00 AM', close: '11:00 PM' },
        { day: 'Saturday', open: '10:00 AM', close: '11:00 PM' },
        { day: 'Sunday', open: '10:00 AM', close: '9:00 PM' },
      ],
      photos: ['🍽️', '👨‍🍳', '🏪'],
    };
    
    res.json(detailedRestaurant);
  } catch (error) {
    console.error('Error getting restaurant details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get restaurant details'
    });
  }
});

// Partner restaurants endpoint (used by the frontend)
app.get('/api/partner-restaurants', (req, res) => {
  res.json({
    restaurants: mockRestaurants.map(r => ({
      id: r.id,
      name: r.name,
      cuisine: r.categories[1] || r.categories[0],
      location: r.location.city,
      partnership_type: 'direct'
    }))
  });
});

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The endpoint ${req.path} is not available`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/restaurants',
      'GET /api/restaurants/:id',
      'GET /api/partner-restaurants'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 FoodAI Backend API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🍽️  Restaurant search: http://localhost:${PORT}/api/restaurants`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET /api/health - Server health check`);
  console.log(`   GET /api/restaurants - Search restaurants with query params`);
  console.log(`   GET /api/restaurants/:id - Get restaurant details`);
  console.log(`   GET /api/partner-restaurants - Get partner restaurants`);
  console.log(`\n📖 Example: http://localhost:${PORT}/api/restaurants?location=downtown&query=restaurants&radius=5000\n`);
});

module.exports = app;
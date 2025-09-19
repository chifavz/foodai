// Express.js Backend Server for FoodAI Restaurant API
// Implements all restaurant endpoints as specified in the problem statement

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Environment variables
const YELP_API_KEY = process.env.YELP_API_KEY || 'YOUR_YELP_API_KEY';
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const YELP_BASE_URL = 'https://api.yelp.com/v3';
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Fallback restaurant data for when external APIs are unavailable
const fallbackRestaurants = [
  {
    id: 'fallback-1',
    name: "Sofia's Gourmet Kitchen",
    rating: 4.8,
    reviewCount: 324,
    categories: ['Italian', 'Fine Dining'],
    location: {
      address1: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zip_code: '02101',
      country: 'US'
    },
    phone: '+1-617-555-0123',
    image: 'https://via.placeholder.com/300x200?text=Sofia%27s+Kitchen',
    price: '$$$',
    coordinates: { latitude: 42.3601, longitude: -71.0589 },
    url: 'https://example.com/sofias-kitchen',
    isOpenNow: true,
    hours: [
      { is_open_now: true, day: 0, start: '1100', end: '2200' },
      { is_open_now: true, day: 1, start: '1100', end: '2200' }
    ],
    attributes: { delivery: true, pickup: true },
    distance: 0.5
  },
  {
    id: 'fallback-2',
    name: "Marco's Pizza Palace",
    rating: 4.5,
    reviewCount: 198,
    categories: ['Pizza', 'Italian'],
    location: {
      address1: '456 Oak Ave',
      city: 'Boston',
      state: 'MA',
      zip_code: '02102',
      country: 'US'
    },
    phone: '+1-617-555-0456',
    image: 'https://via.placeholder.com/300x200?text=Marco%27s+Pizza',
    price: '$$',
    coordinates: { latitude: 42.3505, longitude: -71.0765 },
    url: 'https://example.com/marcos-pizza',
    isOpenNow: true,
    hours: [
      { is_open_now: true, day: 0, start: '1000', end: '2300' }
    ],
    attributes: { delivery: true, pickup: true },
    distance: 1.2
  },
  {
    id: 'fallback-3',
    name: "Garden Fresh Vegetarian",
    rating: 4.6,
    reviewCount: 156,
    categories: ['Vegetarian', 'Healthy'],
    location: {
      address1: '789 Green St',
      city: 'Boston',
      state: 'MA',
      zip_code: '02103',
      country: 'US'
    },
    phone: '+1-617-555-0789',
    image: 'https://via.placeholder.com/300x200?text=Garden+Fresh',
    price: '$$',
    coordinates: { latitude: 42.3584, longitude: -71.0598 },
    url: 'https://example.com/garden-fresh',
    isOpenNow: false,
    hours: [
      { is_open_now: false, day: 0, start: '0800', end: '2000' }
    ],
    attributes: { delivery: true, pickup: true },
    distance: 0.8
  }
];

// Fallback menu data
const fallbackMenus = {
  'fallback-1': {
    categories: [
      {
        name: 'Appetizers',
        items: [
          { id: 1, name: 'Bruschetta', price: 12, description: 'Toasted bread with tomatoes and basil', dietary: ['vegetarian'] },
          { id: 2, name: 'Calamari Fritti', price: 16, description: 'Crispy fried squid with marinara sauce', dietary: [] }
        ]
      },
      {
        name: 'Main Courses',
        items: [
          { id: 3, name: 'Osso Buco', price: 32, description: 'Braised veal shanks with risotto', dietary: [] },
          { id: 4, name: 'Seafood Risotto', price: 28, description: 'Creamy risotto with mixed seafood', dietary: [] }
        ]
      }
    ]
  },
  'fallback-2': {
    categories: [
      {
        name: 'Pizzas',
        items: [
          { id: 5, name: 'Margherita', price: 18, description: 'Fresh mozzarella, tomato sauce, basil', dietary: ['vegetarian'] },
          { id: 6, name: 'Pepperoni Supreme', price: 22, description: 'Pepperoni, mushrooms, bell peppers, onions', dietary: [] }
        ]
      }
    ]
  },
  'fallback-3': {
    categories: [
      {
        name: 'Salads',
        items: [
          { id: 7, name: 'Quinoa Bowl', price: 14, description: 'Quinoa with roasted vegetables and tahini dressing', dietary: ['vegan', 'gluten-free'] },
          { id: 8, name: 'Mediterranean Salad', price: 16, description: 'Mixed greens with feta, olives, and vinaigrette', dietary: ['vegetarian'] }
        ]
      }
    ]
  }
};

// Fallback reviews data
const fallbackReviews = {
  'fallback-1': [
    {
      id: 'review-1-1',
      rating: 5,
      text: 'Amazing food and excellent service! The osso buco was perfectly prepared.',
      timeCreated: '2024-01-15T19:30:00Z',
      user: {
        id: 'user-1',
        name: 'John D.',
        profileUrl: 'https://example.com/users/john',
        imageUrl: 'https://via.placeholder.com/50x50?text=JD'
      }
    },
    {
      id: 'review-1-2',
      rating: 4,
      text: 'Great atmosphere and delicious Italian cuisine. Will definitely return!',
      timeCreated: '2024-01-10T20:15:00Z',
      user: {
        id: 'user-2',
        name: 'Maria S.',
        profileUrl: 'https://example.com/users/maria',
        imageUrl: 'https://via.placeholder.com/50x50?text=MS'
      }
    }
  ]
};

// Helper function to apply filters to restaurants
function applyFilters(restaurants, filters) {
  let filtered = [...restaurants];

  if (filters.city) {
    filtered = filtered.filter(r => 
      r.location.city.toLowerCase() === filters.city.toLowerCase()
    );
  }

  if (filters.cuisines) {
    const cuisines = Array.isArray(filters.cuisines) ? filters.cuisines : [filters.cuisines];
    filtered = filtered.filter(r => 
      r.categories.some(cat => 
        cuisines.some(cuisine => 
          cat.toLowerCase().includes(cuisine.toLowerCase())
        )
      )
    );
  }

  if (filters.minRating) {
    filtered = filtered.filter(r => r.rating >= parseFloat(filters.minRating));
  }

  if (filters.openNow === 'true') {
    filtered = filtered.filter(r => r.isOpenNow);
  }

  if (filters.priceRange) {
    filtered = filtered.filter(r => r.price === filters.priceRange);
  }

  // Apply limit
  if (filters.limit) {
    filtered = filtered.slice(0, parseInt(filters.limit));
  }

  return filtered;
}

// Helper function to search restaurants using Yelp API
async function searchYelpRestaurants(params) {
  try {
    if (!YELP_API_KEY || YELP_API_KEY === 'YOUR_YELP_API_KEY') {
      throw new Error('Yelp API key not configured');
    }

    const yelpParams = {
      location: params.city || params.location || 'Boston, MA',
      term: params.query || 'restaurants',
      limit: Math.min(parseInt(params.limit) || 20, 50),
      categories: 'restaurants'
    };

    if (params.cuisines) {
      yelpParams.term = `${params.cuisines} restaurants`;
    }

    if (params.latitude && params.longitude) {
      yelpParams.latitude = parseFloat(params.latitude);
      yelpParams.longitude = parseFloat(params.longitude);
      delete yelpParams.location;
    }

    if (params.radius) {
      yelpParams.radius = Math.min(parseInt(params.radius) * 1000, 40000); // Convert km to meters, max 40km
    }

    const response = await axios.get(`${YELP_BASE_URL}/businesses/search`, {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
      },
      params: yelpParams,
      timeout: 5000
    });

    return response.data.businesses.map(business => ({
      id: business.id,
      name: business.name,
      rating: business.rating,
      reviewCount: business.review_count,
      categories: business.categories.map(cat => cat.title),
      location: business.location,
      phone: business.phone,
      image: business.image_url,
      price: business.price || '$$',
      coordinates: business.coordinates,
      url: business.url,
      isOpenNow: !business.is_closed,
      hours: business.hours?.[0]?.open || [],
      attributes: business.attributes || {},
      distance: business.distance ? (business.distance / 1000).toFixed(1) : null
    }));

  } catch (error) {
    console.warn('Yelp API error, using fallback data:', error.message);
    return null;
  }
}

// API ENDPOINTS

// 1. GET /api/restaurants - Fetch restaurants (with filters and optional Sofia integration)
app.get('/api/restaurants', async (req, res) => {
  try {
    const filters = req.query;
    let restaurants = [];

    // Try external API first
    const yelpResults = await searchYelpRestaurants(filters);
    if (yelpResults && yelpResults.length > 0) {
      restaurants = yelpResults;
    } else {
      // Use fallback data
      restaurants = applyFilters(fallbackRestaurants, filters);
    }

    // Apply sorting
    if (filters.sortBy) {
      const sortBy = filters.sortBy;
      const sortOrder = filters.sortOrder === 'ASC' ? 1 : -1;

      restaurants.sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.rating - a.rating) * sortOrder;
        } else if (sortBy === 'distance') {
          const aDistance = parseFloat(a.distance) || 0;
          const bDistance = parseFloat(b.distance) || 0;
          return (aDistance - bDistance) * sortOrder;
        } else if (sortBy === 'reviewCount') {
          return (b.reviewCount - a.reviewCount) * sortOrder;
        }
        return 0;
      });
    }

    res.json({
      restaurants,
      total: restaurants.length,
      filters: filters,
      source: yelpResults ? 'yelp' : 'fallback'
    });

  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      error: 'Failed to fetch restaurants',
      details: error.message
    });
  }
});

// 2. GET /api/restaurants/search - Alias for restaurant search
app.get('/api/restaurants/search', async (req, res) => {
  // Redirect to main restaurants endpoint
  req.url = '/api/restaurants';
  return app._router.handle(req, res);
});

// 3. GET /api/restaurants/popular - Popular restaurants
app.get('/api/restaurants/popular', async (req, res) => {
  try {
    const filters = {
      ...req.query,
      sortBy: 'rating',
      sortOrder: 'DESC',
      limit: req.query.limit || '10',
      minRating: req.query.minRating || '4.0'
    };

    // Use the main restaurants logic
    req.query = filters;
    req.url = '/api/restaurants';
    return app._router.handle(req, res);

  } catch (error) {
    console.error('Error fetching popular restaurants:', error);
    res.status(500).json({
      error: 'Failed to fetch popular restaurants',
      details: error.message
    });
  }
});

// 4. GET /api/restaurants/:id - Get a specific restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let restaurant = null;

    // Try Yelp API first
    try {
      if (YELP_API_KEY && YELP_API_KEY !== 'YOUR_YELP_API_KEY') {
        const response = await axios.get(`${YELP_BASE_URL}/businesses/${id}`, {
          headers: {
            'Authorization': `Bearer ${YELP_API_KEY}`,
          },
          timeout: 5000
        });

        restaurant = {
          id: response.data.id,
          name: response.data.name,
          rating: response.data.rating,
          reviewCount: response.data.review_count,
          categories: response.data.categories.map(cat => cat.title),
          location: response.data.location,
          phone: response.data.phone,
          photos: response.data.photos || [],
          hours: response.data.hours?.[0]?.open || [],
          price: response.data.price || '$$',
          coordinates: response.data.coordinates,
          url: response.data.url,
          isOpenNow: !response.data.is_closed,
          attributes: response.data.attributes || {},
        };
      }
    } catch (error) {
      console.warn('Yelp API error for restaurant details:', error.message);
    }

    // Use fallback data if Yelp failed
    if (!restaurant) {
      restaurant = fallbackRestaurants.find(r => r.id === id);
    }

    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found',
        details: `Restaurant with ID ${id} does not exist`
      });
    }

    res.json({ restaurant });

  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({
      error: 'Failed to fetch restaurant details',
      details: error.message
    });
  }
});

// 5. GET /api/restaurants/:id/menu - Get a restaurant's menu
app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For now, use fallback menu data
    // In a real implementation, this would integrate with menu APIs like ChowNow or OpenMenu
    const menu = fallbackMenus[id];

    if (!menu) {
      // Generate a basic menu for any restaurant ID
      const basicMenu = {
        categories: [
          {
            name: 'Popular Items',
            items: [
              { id: Date.now(), name: 'House Special', price: 18, description: 'Our signature dish', dietary: [] },
              { id: Date.now() + 1, name: 'Chef\'s Recommendation', price: 22, description: 'Recommended by our chef', dietary: [] }
            ]
          }
        ]
      };
      return res.json(basicMenu);
    }

    res.json(menu);

  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    res.status(500).json({
      error: 'Failed to fetch restaurant menu',
      details: error.message
    });
  }
});

// 6. GET /api/restaurants/:id/reviews - Get restaurant reviews
app.get('/api/restaurants/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    let reviews = [];

    // Try Yelp API first
    try {
      if (YELP_API_KEY && YELP_API_KEY !== 'YOUR_YELP_API_KEY') {
        const response = await axios.get(`${YELP_BASE_URL}/businesses/${id}/reviews`, {
          headers: {
            'Authorization': `Bearer ${YELP_API_KEY}`,
          },
          timeout: 5000
        });

        reviews = response.data.reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          text: review.text,
          timeCreated: review.time_created,
          user: {
            id: review.user.id,
            name: review.user.name,
            profileUrl: review.user.profile_url,
            imageUrl: review.user.image_url,
          },
        }));
      }
    } catch (error) {
      console.warn('Yelp API error for reviews:', error.message);
    }

    // Use fallback data if Yelp failed
    if (reviews.length === 0) {
      reviews = fallbackReviews[id] || [
        {
          id: `review-${id}-fallback`,
          rating: 4,
          text: 'Great food and service!',
          timeCreated: new Date().toISOString(),
          user: {
            id: 'user-fallback',
            name: 'Customer',
            profileUrl: '#',
            imageUrl: 'https://via.placeholder.com/50x50?text=C'
          }
        }
      ];
    }

    res.json({
      reviews,
      total: reviews.length,
      source: reviews.length > 0 && fallbackReviews[id] ? 'fallback' : 'yelp'
    });

  } catch (error) {
    console.error('Error fetching restaurant reviews:', error);
    res.status(500).json({
      error: 'Failed to fetch restaurant reviews',
      details: error.message
    });
  }
});

// 7. GET /api/restaurants/:id/availability - Check restaurant availability
app.get('/api/restaurants/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    
    // For demo purposes, return availability based on current time
    const now = new Date();
    const hour = now.getHours();
    const isOpenNow = hour >= 10 && hour <= 22; // Open 10 AM to 10 PM
    
    const availability = {
      isOpen: isOpenNow,
      nextOpenTime: isOpenNow ? null : '10:00 AM',
      nextCloseTime: isOpenNow ? '10:00 PM' : null,
      hours: {
        monday: { open: '10:00', close: '22:00' },
        tuesday: { open: '10:00', close: '22:00' },
        wednesday: { open: '10:00', close: '22:00' },
        thursday: { open: '10:00', close: '22:00' },
        friday: { open: '10:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '11:00', close: '21:00' }
      },
      specialHours: null,
      deliveryAvailable: true,
      pickupAvailable: true,
      estimatedDeliveryTime: isOpenNow ? '30-45 minutes' : 'Closed',
      estimatedPickupTime: isOpenNow ? '15-20 minutes' : 'Closed'
    };

    res.json(availability);

  } catch (error) {
    console.error('Error checking restaurant availability:', error);
    res.status(500).json({
      error: 'Failed to check restaurant availability',
      details: error.message
    });
  }
});

// 8. POST /api/restaurants/:id/delivery-estimate - Get delivery estimate for a restaurant
app.post('/api/restaurants/:id/delivery-estimate', async (req, res) => {
  try {
    const { id } = req.params;
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        error: 'Address is required',
        details: 'Please provide a delivery address'
      });
    }

    // For demo purposes, calculate estimate based on address length (simulating distance calculation)
    const baseTime = 25; // Base delivery time in minutes
    const addressComplexity = address.length > 50 ? 10 : 5; // Add time for complex addresses
    const estimatedTime = baseTime + addressComplexity + Math.floor(Math.random() * 10);

    const estimate = {
      restaurantId: id,
      address,
      estimatedDeliveryTime: `${estimatedTime}-${estimatedTime + 15} minutes`,
      deliveryFee: 2.99,
      serviceFee: 1.99,
      taxes: 1.50,
      minimumOrder: 15.00,
      isDeliveryAvailable: true,
      estimatedDistance: `${(Math.random() * 5 + 1).toFixed(1)} miles`,
      deliveryInstructions: 'Leave at door if no answer'
    };

    res.json(estimate);

  } catch (error) {
    console.error('Error calculating delivery estimate:', error);
    res.status(500).json({
      error: 'Failed to calculate delivery estimate',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'foodai-restaurant-api',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    apiConfigured: {
      yelp: !!(YELP_API_KEY && YELP_API_KEY !== 'YOUR_YELP_API_KEY'),
      googlePlaces: !!GOOGLE_PLACES_API_KEY
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      'GET /api/restaurants',
      'GET /api/restaurants/search',
      'GET /api/restaurants/popular',
      'GET /api/restaurants/:id',
      'GET /api/restaurants/:id/menu',
      'GET /api/restaurants/:id/reviews',
      'GET /api/restaurants/:id/availability',
      'POST /api/restaurants/:id/delivery-estimate',
      'GET /api/health'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FoodAI Restaurant API Server running on port ${PORT}`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`🔑 API Key configured: ${!!(YELP_API_KEY && YELP_API_KEY !== 'YOUR_YELP_API_KEY')}`);
  console.log('\n📋 Available endpoints:');
  console.log('  GET  /api/restaurants');
  console.log('  GET  /api/restaurants/search');
  console.log('  GET  /api/restaurants/popular');
  console.log('  GET  /api/restaurants/:id');
  console.log('  GET  /api/restaurants/:id/menu');
  console.log('  GET  /api/restaurants/:id/reviews');
  console.log('  GET  /api/restaurants/:id/availability');
  console.log('  POST /api/restaurants/:id/delivery-estimate');
  console.log('  GET  /api/health');
  console.log('\n✨ Ready to serve restaurant data!');
});

module.exports = app;
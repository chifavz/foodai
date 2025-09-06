// Example API Integration Code (Yelp Fusion)
// Below is a minimal example using Node.js (Express + Axios) to fetch restaurant menus from Yelp Fusion.
// Note: Yelp's API returns business details and categories, but not always full menus.

const express = require('express');
const axios = require('axios');
const app = express();

const YELP_API_KEY = 'YOUR_YELP_API_KEY';
const YELP_BASE_URL = 'https://api.yelp.com/v3';

// Middleware
app.use(express.json());

// Enable CORS for frontend integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Route to search for restaurants
app.get('/api/restaurants/search', async (req, res) => {
  try {
    const { location, term = 'restaurants', limit = 20 } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    const response = await axios.get(`${YELP_BASE_URL}/businesses/search`, {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
      },
      params: {
        location,
        term,
        limit,
        categories: 'restaurants',
      },
    });

    // Format the response for our frontend
    const restaurants = response.data.businesses.map(business => ({
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
      isOpenNow: business.is_closed === false,
    }));

    res.json({
      restaurants,
      total: response.data.total,
      region: response.data.region,
    });

  } catch (error) {
    console.error('Yelp API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch restaurants',
      details: error.response?.data?.error || error.message,
    });
  }
});

// Route to get restaurant details
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${YELP_BASE_URL}/businesses/${id}`, {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
      },
    });

    const restaurant = {
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
      isOpenNow: response.data.is_closed === false,
      attributes: response.data.attributes || {},
    };

    res.json({ restaurant });

  } catch (error) {
    console.error('Yelp API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch restaurant details',
      details: error.response?.data?.error || error.message,
    });
  }
});

// Route to get restaurant reviews
app.get('/api/restaurants/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${YELP_BASE_URL}/businesses/${id}/reviews`, {
      headers: {
        'Authorization': `Bearer ${YELP_API_KEY}`,
      },
    });

    const reviews = response.data.reviews.map(review => ({
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

    res.json({
      reviews,
      total: response.data.total,
      possibleLanguages: response.data.possible_languages,
    });

  } catch (error) {
    console.error('Yelp API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch restaurant reviews',
      details: error.response?.data?.error || error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'yelp-integration',
    timestamp: new Date().toISOString(),
    apiConfigured: !!YELP_API_KEY && YELP_API_KEY !== 'YOUR_YELP_API_KEY',
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Yelp Integration Server running on port ${PORT}`);
  console.log(`API Key configured: ${!!YELP_API_KEY && YELP_API_KEY !== 'YOUR_YELP_API_KEY'}`);
  console.log('Available endpoints:');
  console.log('  GET /api/restaurants/search?location=<location>&term=<term>&limit=<limit>');
  console.log('  GET /api/restaurants/:id');
  console.log('  GET /api/restaurants/:id/reviews');
  console.log('  GET /api/health');
});

// Export for use in other modules
module.exports = app;

// If you want actual menu items, you may need OpenMenu or ChowNow, as they provide structured menu data.
// This Yelp integration is great for business discovery and basic restaurant information.
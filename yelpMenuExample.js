// Example API Integration Code (Yelp Fusion)
// Below is a minimal example using Node.js (Express + Axios) to fetch restaurant menus from Yelp Fusion.
// Note: Yelp's API returns business details and categories, but not always full menus.

const express = require('express');
const axios = require('axios');
const { specs, swaggerUi, setup } = require('./swagger');
const app = express();

const YELP_API_KEY = 'YOUR_YELP_API_KEY';
const YELP_BASE_URL = 'https://api.yelp.com/v3';

// Middleware
app.use(express.json());

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, setup);

// Enable CORS for frontend integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

/**
 * @swagger
 * /api/restaurants/search:
 *   get:
 *     summary: Search for restaurants by location
 *     description: Search for restaurants using Yelp Fusion API based on location and optional search terms
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location to search for restaurants (e.g., "New York, NY" or "10001")
 *         example: "New York, NY"
 *       - in: query
 *         name: term
 *         required: false
 *         schema:
 *           type: string
 *           default: "restaurants"
 *         description: Search term to filter restaurants
 *         example: "pizza"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Number of restaurants to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Successful response with restaurant list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestaurantSearchResponse'
 *       400:
 *         description: Bad request - missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Location parameter is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to fetch restaurants"
 *               details: "API quota exceeded"
 */
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

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get detailed information about a specific restaurant
 *     description: Retrieve comprehensive details about a restaurant including hours, photos, and attributes
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique restaurant ID from Yelp
 *         example: "WavvLdfdP6g8aZTtbBQHTw"
 *     responses:
 *       200:
 *         description: Successful response with restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Restaurant not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to fetch restaurant details"
 *               details: "Invalid business ID"
 */
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

/**
 * @swagger
 * /api/restaurants/{id}/reviews:
 *   get:
 *     summary: Get reviews for a specific restaurant
 *     description: Retrieve customer reviews and ratings for a restaurant
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique restaurant ID from Yelp
 *         example: "WavvLdfdP6g8aZTtbBQHTw"
 *     responses:
 *       200:
 *         description: Successful response with restaurant reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Restaurant not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to fetch restaurant reviews"
 *               details: "Invalid business ID"
 */
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

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check the health status of the API service and verify API configuration
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "healthy"
 *               service: "yelp-integration"
 *               timestamp: "2024-09-20T04:45:00.000Z"
 *               apiConfigured: true
 */
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
  console.log(`Swagger UI available at: http://localhost:${PORT}/api-docs`);
  console.log('Available endpoints:');
  console.log('  GET /api/restaurants/search?location=<location>&term=<term>&limit=<limit>');
  console.log('  GET /api/restaurants/:id');
  console.log('  GET /api/restaurants/:id/reviews');
  console.log('  GET /api/health');
  console.log('  GET /api-docs (Swagger UI)');
});

// Export for use in other modules
module.exports = app;

// If you want actual menu items, you may need OpenMenu or ChowNow, as they provide structured menu data.
// This Yelp integration is great for business discovery and basic restaurant information.
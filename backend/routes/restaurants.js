const express = require('express');
const axios = require('axios');
const router = express.Router();

// Load environment variables
require('dotenv').config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// Fallback restaurant data for when API is not available
const getFallbackRestaurants = (location, query) => {
  return {
    results: [
      {
        place_id: 'fallback-restaurant-1',
        name: 'Downtown Bistro',
        rating: 4.4,
        user_ratings_total: 187,
        types: ['restaurant', 'food', 'establishment'],
        formatted_address: `123 Main Street, ${location}`,
        opening_hours: { open_now: true },
        price_level: 2,
        geometry: {
          location: { lat: 40.7128, lng: -74.0060 }
        }
      },
      {
        place_id: 'fallback-restaurant-2',
        name: 'Golden Dragon Chinese',
        rating: 4.6,
        user_ratings_total: 234,
        types: ['restaurant', 'food', 'establishment'],
        formatted_address: `456 Oak Avenue, ${location}`,
        opening_hours: { open_now: true },
        price_level: 2,
        geometry: {
          location: { lat: 40.7130, lng: -74.0062 }
        }
      },
      {
        place_id: 'fallback-restaurant-3',
        name: 'Mama Rosa\'s Italian',
        rating: 4.7,
        user_ratings_total: 156,
        types: ['restaurant', 'food', 'establishment'],
        formatted_address: `789 Pine Street, ${location}`,
        opening_hours: { open_now: false },
        price_level: 3,
        geometry: {
          location: { lat: 40.7132, lng: -74.0064 }
        }
      }
    ],
    status: 'OK',
    html_attributions: []
  };
};

// Route to handle restaurant search
router.get('/', async (req, res) => {
  const { location, query, radius } = req.query;

  if (!location || !query || !radius) {
    return res.status(400).json({ error: 'Missing required query parameters: location, query, or radius' });
  }

  // Check if API key is configured
  if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.trim() === '') {
    console.log('Google Places API key not configured, using fallback data');
    return res.json(getFallbackRestaurants(location, query));
  }

  try {
    console.log('Requesting Google Places API with params:', {
      query: `${query} in ${location}`,
      radius,
      key: GOOGLE_PLACES_API_KEY ? '[CONFIGURED]' : '[NOT_CONFIGURED]',
    });

    const response = await axios.get(GOOGLE_PLACES_API_URL, {
      params: {
        query: `${query} in ${location}`,
        radius,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    // Check for API errors
    if (response.data.status === 'REQUEST_DENIED') {
      console.error('Google Places API request denied - likely invalid API key');
      return res.json(getFallbackRestaurants(location, query));
    }

    if (response.data.status === 'OVER_QUERY_LIMIT') {
      console.error('Google Places API quota exceeded');
      return res.json(getFallbackRestaurants(location, query));
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error.response?.data || error.message);
    
    // Return fallback data instead of error
    console.log('Falling back to local restaurant data');
    res.json(getFallbackRestaurants(location, query));
  }
});

module.exports = router;
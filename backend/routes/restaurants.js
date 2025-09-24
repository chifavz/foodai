const express = require('express');
const axios = require('axios');
const router = express.Router();

// Load environment variables
require('dotenv').config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

// Route to handle restaurant search
router.get('/', async (req, res) => {
  const { location, query, radius } = req.query;

  if (!location || !query || !radius) {
    return res.status(400).json({ error: 'Missing required query parameters: location, query, or radius' });
  }

  try {
    console.log('Requesting Google Places API with params:', {
      query: `${query} in ${location}`,
      radius,
      key: GOOGLE_PLACES_API_KEY,
    });

    const response = await axios.get(GOOGLE_PLACES_API_URL, {
      params: {
        query: `${query} in ${location}`,
        radius,
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Google Places API:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Places API' });
  }
});

module.exports = router;
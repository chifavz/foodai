require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow React dev server
  credentials: true
}));

// Google Places API endpoint
app.get('/api/places', async (req, res) => {
  try {
    const { lat, lng, radius = 1500, type = 'restaurant', query } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Google Places API key not configured on server' 
      });
    }

    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    // Import node-fetch dynamically (ES modules compatibility)
    const fetch = (await import('node-fetch')).default;

    let url;
    if (query) {
      // Text search with location bias
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`;
    } else {
      // Nearby search
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
    }

    console.log('Making Google Places API request:', { lat, lng, radius, type, query });

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      return res.status(400).json({ 
        error: data.error_message || data.status 
      });
    }

    console.log(`Google Places API returned ${data.results?.length || 0} results`);
    res.json(data.results || []);
  } catch (err) {
    console.error('Server error in /api/places:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Google Places API key configured: ${!!process.env.GOOGLE_PLACES_API_KEY}`);
});
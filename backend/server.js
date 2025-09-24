const express = require('express');
const cors = require('cors');
const restaurantsRoute = require('./routes/restaurants');

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  const googleApiConfigured = !!(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACES_API_KEY.trim() !== '');
  
  res.json({
    status: 'healthy',
    service: 'foodai-backend',
    timestamp: new Date().toISOString(),
    apiConfigured: {
      googlePlaces: googleApiConfigured
    }
  });
});

// Routes
app.use('/api/restaurants', restaurantsRoute);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google Places API configured: ${!!(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACES_API_KEY.trim() !== '')}`);
});
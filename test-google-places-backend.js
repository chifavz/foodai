// Test script to demonstrate Google Places API backend integration
// This simulates how the system works with a real API key

const express = require('express');
const cors = require('cors');

// Mock Google Places API response
const mockGooglePlacesResponse = {
  results: [
    {
      place_id: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      name: "Tony's Little Italy Pizza",
      vicinity: "123 Main Street, San Francisco",
      rating: 4.5,
      price_level: 2,
      types: ["restaurant", "food", "establishment"],
      geometry: {
        location: {
          lat: 37.7749,
          lng: -122.4194
        }
      },
      opening_hours: {
        open_now: true
      },
      photos: [
        {
          photo_reference: "mock_photo_reference",
          height: 400,
          width: 400
        }
      ]
    },
    {
      place_id: "ChIJrTLr-GyuEmsRBfy61i59si0", 
      name: "Bella Vista Italian Restaurant",
      vicinity: "456 Union Square, San Francisco",
      rating: 4.2,
      price_level: 3,
      types: ["restaurant", "food", "establishment"],
      geometry: {
        location: {
          lat: 37.7849,
          lng: -122.4094
        }
      },
      opening_hours: {
        open_now: true
      }
    }
  ],
  status: "OK"
};

// Create test server that simulates working backend
const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Simulate working Google Places API endpoint
app.get('/api/places', (req, res) => {
  const { lat, lng, query } = req.query;
  
  console.log(`📍 Places API called: lat=${lat}, lng=${lng}, query=${query}`);
  
  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  // Simulate API delay
  setTimeout(() => {
    console.log(`✅ Returning ${mockGooglePlacesResponse.results.length} mock restaurants`);
    res.json(mockGooglePlacesResponse.results);
  }, 500);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'test', timestamp: new Date().toISOString() });
});

const PORT = 5001; // Use different port to avoid conflicts

app.listen(PORT, () => {
  console.log(`🧪 Test backend server running on port ${PORT}`);
  console.log(`🔐 Simulating secure Google Places API proxy`);
  console.log(`📋 Test endpoint: http://localhost:${PORT}/api/places?lat=37.7749&lng=-122.4194&query=italian`);
  console.log('');
  console.log('🎯 This demonstrates how the system works with a real API key:');
  console.log('   1. Frontend calls backend /api/places');
  console.log('   2. Backend validates parameters');
  console.log('   3. Backend calls Google Places API with server-side key');
  console.log('   4. Backend returns results to frontend');
  console.log('   ✅ No referrer restrictions, API key stays secure!');
});
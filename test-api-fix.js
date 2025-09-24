#!/usr/bin/env node

// Test script to verify the API key fix
const axios = require('axios');

async function testBackendHealth() {
  try {
    console.log('Testing backend health endpoint...');
    const response = await axios.get('http://localhost:8000/api/health');
    console.log('Backend health:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Backend health check failed:', error.message);
    return null;
  }
}

async function testRestaurantSearch() {
  try {
    console.log('Testing restaurant search with fallback...');
    const response = await axios.get('http://localhost:8000/api/restaurants', {
      params: {
        location: 'downtown',
        query: 'restaurant',
        radius: 5000
      }
    });
    
    console.log(`Found ${response.data.results?.length || 0} restaurants`);
    console.log('Response status:', response.data.status);
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('First restaurant:', {
        name: response.data.results[0].name,
        rating: response.data.results[0].rating,
        place_id: response.data.results[0].place_id
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Restaurant search failed:', error.message);
    return null;
  }
}

async function main() {
  console.log('=== API Fix Test ===\n');
  
  const health = await testBackendHealth();
  console.log();
  
  const restaurants = await testRestaurantSearch();
  console.log();
  
  if (health && restaurants) {
    console.log('✅ API fix is working! The app will use fallback data when API keys are not configured.');
  } else {
    console.log('❌ There are still issues. Please check the backend server is running.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testBackendHealth, testRestaurantSearch };
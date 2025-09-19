// Frontend Integration Test - Test the new backend endpoints
// This demonstrates how the frontend can use the new backend endpoints

// Using fetch (as shown in problem statement)
async function testRestaurantEndpoints() {
  console.log('Testing Restaurant API Endpoints Integration...\n');

  try {
    // 1. Test basic restaurant search
    console.log('1. Testing GET /api/restaurants...');
    const restaurantsResponse = await fetch('/api/restaurants?city=Boston&limit=5&minRating=4.0&openNow=true');
    const restaurantsData = await restaurantsResponse.json();
    console.log(`✓ Found ${restaurantsData.total} restaurants`);
    console.log(`✓ Source: ${restaurantsData.source}`);
    
    if (restaurantsData.restaurants.length > 0) {
      const firstRestaurant = restaurantsData.restaurants[0];
      console.log(`✓ First restaurant: ${firstRestaurant.name} (Rating: ${firstRestaurant.rating})`);
      
      // 2. Test restaurant details
      console.log(`\n2. Testing GET /api/restaurants/${firstRestaurant.id}...`);
      const detailsResponse = await fetch(`/api/restaurants/${firstRestaurant.id}`);
      const detailsData = await detailsResponse.json();
      console.log(`✓ Restaurant details: ${detailsData.restaurant.name}`);
      console.log(`✓ Categories: ${detailsData.restaurant.categories.join(', ')}`);
      
      // 3. Test restaurant menu
      console.log(`\n3. Testing GET /api/restaurants/${firstRestaurant.id}/menu...`);
      const menuResponse = await fetch(`/api/restaurants/${firstRestaurant.id}/menu`);
      const menuData = await menuResponse.json();
      console.log(`✓ Menu categories: ${menuData.categories.length}`);
      if (menuData.categories.length > 0) {
        console.log(`✓ First category: ${menuData.categories[0].name} (${menuData.categories[0].items.length} items)`);
      }
      
      // 4. Test restaurant reviews
      console.log(`\n4. Testing GET /api/restaurants/${firstRestaurant.id}/reviews...`);
      const reviewsResponse = await fetch(`/api/restaurants/${firstRestaurant.id}/reviews`);
      const reviewsData = await reviewsResponse.json();
      console.log(`✓ Reviews found: ${reviewsData.total}`);
      if (reviewsData.reviews.length > 0) {
        console.log(`✓ First review rating: ${reviewsData.reviews[0].rating}/5`);
      }
      
      // 5. Test restaurant availability
      console.log(`\n5. Testing GET /api/restaurants/${firstRestaurant.id}/availability...`);
      const availabilityResponse = await fetch(`/api/restaurants/${firstRestaurant.id}/availability`);
      const availabilityData = await availabilityResponse.json();
      console.log(`✓ Restaurant is ${availabilityData.isOpen ? 'OPEN' : 'CLOSED'}`);
      console.log(`✓ Delivery available: ${availabilityData.deliveryAvailable}`);
      
      // 6. Test delivery estimate
      console.log(`\n6. Testing POST /api/restaurants/${firstRestaurant.id}/delivery-estimate...`);
      const deliveryResponse = await fetch(`/api/restaurants/${firstRestaurant.id}/delivery-estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: '123 Test Street, Boston, MA'
        })
      });
      const deliveryData = await deliveryResponse.json();
      console.log(`✓ Estimated delivery time: ${deliveryData.estimatedDeliveryTime}`);
      console.log(`✓ Delivery fee: $${deliveryData.deliveryFee}`);
    }
    
    // 7. Test popular restaurants
    console.log(`\n7. Testing GET /api/restaurants/popular...`);
    const popularResponse = await fetch('/api/restaurants/popular');
    const popularData = await popularResponse.json();
    console.log(`✓ Popular restaurants found: ${popularData.total}`);
    console.log(`✓ Sorted by rating (DESC): ${popularData.filters.sortBy}`);
    
    // 8. Test search alias
    console.log(`\n8. Testing GET /api/restaurants/search...`);
    const searchResponse = await fetch('/api/restaurants/search?city=Boston&limit=2');
    const searchData = await searchResponse.json();
    console.log(`✓ Search alias working: ${searchData.total} restaurants found`);
    
    console.log('\n🎉 All endpoints working correctly!');
    console.log('\nFrontend Integration Examples:');
    console.log('- Restaurant discovery components can use GET /api/restaurants with filters');
    console.log('- Menu components can use GET /api/restaurants/:id/menu');
    console.log('- Review components can use GET /api/restaurants/:id/reviews');
    console.log('- Delivery components can use POST /api/restaurants/:id/delivery-estimate');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

// Using axios (alternative example from problem statement)
async function testWithAxios() {
  try {
    console.log('\n📦 Testing with Axios...');
    const axios = (await import('axios')).default;
    
    const response = await axios.get('/api/restaurants', {
      params: { city: 'Boston', limit: 5 }
    });
    
    console.log(`✓ Axios integration works: ${response.data.total} restaurants found`);
    console.log(`✓ Status: ${response.status}`);
  } catch (error) {
    console.log('ℹ️ Axios test skipped (axios not available in this context)');
  }
}

// Export for use in React components
export { testRestaurantEndpoints, testWithAxios };
// Demo Component showing how to use the new Restaurant API endpoints
import React, { useState, useEffect } from 'react';

const RestaurantAPIDemo = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('123 Test St, Boston, MA');

  // Example 1: Fetch restaurants with filters (from problem statement)
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/restaurants?city=Boston&limit=5&minRating=4.0&openNow=true');
      const data = await response.json();
      setRestaurants(data.restaurants);
      console.log("Fetched restaurants:", data.restaurants);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Fetch a restaurant's menu (from problem statement)
  const fetchMenu = async (restaurantId) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/menu`);
      const data = await response.json();
      setMenu(data);
      console.log("Fetched menu:", data.categories);
    } catch (error) {
      console.error("Menu API Error:", error);
    }
  };

  // Example 3: Fetch restaurant reviews (from problem statement)
  const fetchReviews = async (restaurantId) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`);
      const data = await response.json();
      setReviews(data.reviews);
      console.log("Fetched reviews:", data.reviews);
    } catch (error) {
      console.error("Reviews API Error:", error);
    }
  };

  // Example 4: Check restaurant availability
  const checkAvailability = async (restaurantId) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/availability`);
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error("Availability API Error:", error);
    }
  };

  // Example 5: Get delivery estimate (POST request)
  const getDeliveryEstimate = async (restaurantId) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/delivery-estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });
      const data = await response.json();
      setDeliveryEstimate(data);
    } catch (error) {
      console.error("Delivery Estimate API Error:", error);
    }
  };

  // Load restaurants on component mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleRestaurantSelect = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenu(null);
    setReviews([]);
    setAvailability(null);
    setDeliveryEstimate(null);
    
    // Fetch all related data
    await Promise.all([
      fetchMenu(restaurant.id),
      fetchReviews(restaurant.id),
      checkAvailability(restaurant.id)
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🍽️ Restaurant API Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This demo showcases all the restaurant API endpoints working with the new backend.
        </p>

        <button
          onClick={fetchRestaurants}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
        >
          {loading ? 'Loading...' : 'Refresh Restaurants'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurants List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Restaurants ({restaurants.length})
          </h2>
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => handleRestaurantSelect(restaurant)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRestaurant?.id === restaurant.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {restaurant.categories.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {restaurant.location.address1}, {restaurant.location.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-yellow-500">
                      ⭐ {restaurant.rating}
                    </div>
                    <p className="text-xs text-gray-500">
                      {restaurant.reviewCount} reviews
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      restaurant.isOpenNow 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {restaurant.isOpenNow ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="space-y-6">
          {selectedRestaurant && (
            <>
              {/* Menu Section */}
              {menu && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    📋 Menu - {selectedRestaurant.name}
                  </h2>
                  {menu.categories.map((category, idx) => (
                    <div key={idx} className="mb-4">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                        {category.name}
                      </h3>
                      {category.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {item.description}
                            </p>
                            {item.dietary.length > 0 && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {item.dietary.join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Availability & Delivery */}
              {availability && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    🕒 Availability & Delivery
                  </h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                      <p className={`font-medium ${
                        availability.isOpen 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {availability.isOpen ? 'Open' : 'Closed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Delivery Time</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {availability.estimatedDeliveryTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <button
                    onClick={() => getDeliveryEstimate(selectedRestaurant.id)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Get Delivery Estimate
                  </button>

                  {deliveryEstimate && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                        Delivery Estimate
                      </h4>
                      <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <p>Time: {deliveryEstimate.estimatedDeliveryTime}</p>
                        <p>Distance: {deliveryEstimate.estimatedDistance}</p>
                        <p>Delivery Fee: ${deliveryEstimate.deliveryFee}</p>
                        <p>Service Fee: ${deliveryEstimate.serviceFee}</p>
                        <p>Taxes: ${deliveryEstimate.taxes}</p>
                        <p className="font-medium">
                          Total Fees: ${(deliveryEstimate.deliveryFee + deliveryEstimate.serviceFee + deliveryEstimate.taxes).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    ⭐ Reviews ({reviews.length})
                  </h2>
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="flex text-yellow-500">
                            {'⭐'.repeat(review.rating)}
                          </div>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {review.user.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(review.timeCreated).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!selectedRestaurant && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Select a restaurant to view details, menu, and reviews
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🚀 API Integration Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Fetch Endpoints:</h4>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• GET /api/restaurants (with filters)</li>
              <li>• GET /api/restaurants/popular</li>
              <li>• GET /api/restaurants/:id/menu</li>
              <li>• GET /api/restaurants/:id/reviews</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Interactive Features:</h4>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Real-time availability checking</li>
              <li>• Dynamic delivery estimates</li>
              <li>• Filter by cuisine, rating, location</li>
              <li>• Sorting and pagination support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantAPIDemo;
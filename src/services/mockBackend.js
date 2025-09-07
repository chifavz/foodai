// Mock Backend Service for Restaurant and Menu APIs
// Step 2: Connect Sophia to the Mock

async function fetchRestaurants() {
  const response = await fetch("http://localhost:5001/restaurants");
  return response.json();
}

async function fetchMenu(restaurantId) {
  const response = await fetch(`http://localhost:5001/restaurants/${restaurantId}/menu`);
  return response.json();
}

// Example usage
(async () => {
  const restaurants = await fetchRestaurants();
  console.log("Available Restaurants:", restaurants);

  const menu = await fetchMenu(1);
  console.log("Menu for Sakura Sushi:", menu);
})();

export { fetchRestaurants, fetchMenu };
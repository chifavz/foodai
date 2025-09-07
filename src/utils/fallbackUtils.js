export const filterMeals = (meals, preferences = {}) => {
  const { cuisine, diet, maxPrice, category, allergens } = preferences;

  return meals.filter(meal => {
    if (cuisine && meal.cuisine.toLowerCase() !== cuisine.toLowerCase()) return false;
    if (diet && meal.diet.toLowerCase() !== diet.toLowerCase()) return false;
    if (maxPrice && meal.price > parseFloat(maxPrice)) return false;
    if (category && category !== 'All' && meal.category !== category) return false;
    if (allergens) {
      const allergenList = Array.isArray(allergens) ? allergens : [allergens];
      if (allergenList.some(a => meal.allergens.includes(a.toLowerCase()))) return false;
    }
    return true;
  });
};

export const fallbackMeals = [
  { id: 1, name: 'Grilled Salmon', price: 28, description: 'Fresh Atlantic salmon', category: 'Main Course', chef: 'Chef Mario', rating: 4.8, image: '🐟', allergens: ['fish'], cuisine: 'Italian', diet: 'pescatarian', restaurant_name: "Chef Mario's Italian Kitchen" },
  { id: 2, name: 'Caesar Salad', price: 15, description: 'Crisp romaine lettuce', category: 'Appetizer', chef: 'Chef Mario', rating: 4.6, image: '🥗', allergens: ['dairy', 'gluten'], cuisine: 'Italian', diet: 'vegetarian', restaurant_name: "Chef Mario's Italian Kitchen" },
  { id: 3, name: 'Beef Wellington', price: 35, description: 'Tender beef wrapped in puff pastry', category: 'Main Course', chef: 'Chef Isabella', rating: 4.9, image: '🥩', allergens: ['gluten', 'eggs'], cuisine: 'French', diet: 'regular', restaurant_name: "Isabella's Fine Dining" },
  { id: 4, name: 'Chocolate Soufflé', price: 12, description: 'Warm chocolate soufflé', category: 'Dessert', chef: 'Chef Pierre', rating: 4.7, image: '🍰', allergens: ['dairy', 'eggs', 'gluten'], cuisine: 'French', diet: 'vegetarian', restaurant_name: "Isabella's Fine Dining" },
  { id: 5, name: 'Quinoa Buddha Bowl', price: 18, description: 'Quinoa bowl with fresh vegetables', category: 'Main Course', chef: 'Chef Sarah', rating: 4.4, image: '🥙', allergens: ['sesame'], cuisine: 'Vegetarian', diet: 'vegan', restaurant_name: "Garden Fresh Vegetarian" },
  { id: 6, name: 'Margherita Pizza', price: 22, description: 'Fresh mozzarella, tomatoes, basil', category: 'Main Course', chef: 'Chef Antonio', rating: 4.5, image: '🍕', allergens: ['gluten', 'dairy'], cuisine: 'Italian', diet: 'vegetarian', restaurant_name: "Antonio's Pizza Place" },
];
export const filterMeals = (meals, preferences = {}) => {
  const { cuisine, diet, maxPrice, category, allergens } = preferences;

  // First, try strict filtering
  const strictFiltered = meals.filter(meal => {
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

  // If strict filtering returns results, use them
  if (strictFiltered.length > 0) {
    return strictFiltered;
  }

  // If no results with strict filtering, try relaxed filtering
  // Only relax non-safety filters (keep allergen filtering strict)
  const relaxedFiltered = meals.filter(meal => {
    // Keep allergen filtering strict for safety
    if (allergens) {
      const allergenList = Array.isArray(allergens) ? allergens : [allergens];
      if (allergenList.some(a => meal.allergens.includes(a.toLowerCase()))) return false;
    }
    
    return true; // Return all meals that don't have excluded allergens
  });

  return relaxedFiltered;
};

// Helper function to get filter suggestions when no meals found
export const getFilterSuggestions = (meals, preferences = {}) => {
  const { cuisine, diet, category } = preferences;
  const suggestions = [];

  if (cuisine) {
    const availableCuisines = [...new Set(meals.map(meal => meal.cuisine))];
    const otherCuisines = availableCuisines.filter(c => c.toLowerCase() !== cuisine.toLowerCase());
    if (otherCuisines.length > 0) {
      suggestions.push(`Try ${otherCuisines.slice(0, 3).join(', ')} cuisine instead`);
    }
  }

  if (diet) {
    const availableDiets = [...new Set(meals.map(meal => meal.diet))];
    const otherDiets = availableDiets.filter(d => d.toLowerCase() !== diet.toLowerCase());
    if (otherDiets.length > 0) {
      suggestions.push(`Try ${otherDiets.slice(0, 3).join(', ')} dietary options`);
    }
  }

  if (category && category !== 'All') {
    const availableCategories = [...new Set(meals.map(meal => meal.category))];
    const otherCategories = availableCategories.filter(c => c !== category);
    if (otherCategories.length > 0) {
      suggestions.push(`Browse ${otherCategories.slice(0, 3).join(', ')} instead`);
    }
  }

  return suggestions;
};

export const fallbackMeals = [
  { id: 1, name: 'Grilled Salmon', price: 28, description: 'Fresh Atlantic salmon', category: 'Main Course', chef: 'Chef Mario', rating: 4.8, image: '🐟', allergens: ['fish'], cuisine: 'Italian', diet: 'pescatarian', restaurant_name: "Chef Mario's Italian Kitchen" },
  { id: 2, name: 'Caesar Salad', price: 15, description: 'Crisp romaine lettuce', category: 'Appetizer', chef: 'Chef Mario', rating: 4.6, image: '🥗', allergens: ['dairy', 'gluten'], cuisine: 'Italian', diet: 'vegetarian', restaurant_name: "Chef Mario's Italian Kitchen" },
  { id: 3, name: 'Beef Wellington', price: 35, description: 'Tender beef wrapped in puff pastry', category: 'Main Course', chef: 'Chef Isabella', rating: 4.9, image: '🥩', allergens: ['gluten', 'eggs'], cuisine: 'French', diet: 'regular', restaurant_name: "Isabella's Fine Dining" },
  { id: 4, name: 'Chocolate Soufflé', price: 12, description: 'Warm chocolate soufflé', category: 'Dessert', chef: 'Chef Pierre', rating: 4.7, image: '🍰', allergens: ['dairy', 'eggs', 'gluten'], cuisine: 'French', diet: 'vegetarian', restaurant_name: "Isabella's Fine Dining" },
  { id: 5, name: 'Quinoa Buddha Bowl', price: 18, description: 'Quinoa bowl with fresh vegetables', category: 'Main Course', chef: 'Chef Sarah', rating: 4.4, image: '🥙', allergens: ['sesame'], cuisine: 'Vegetarian', diet: 'vegan', restaurant_name: "Garden Fresh Vegetarian" },
  { id: 6, name: 'Margherita Pizza', price: 22, description: 'Fresh mozzarella, tomatoes, basil', category: 'Main Course', chef: 'Chef Antonio', rating: 4.5, image: '🍕', allergens: ['gluten', 'dairy'], cuisine: 'Italian', diet: 'vegetarian', restaurant_name: "Antonio's Pizza Place" },
  // Additional diverse meals to provide better coverage
  { id: 7, name: 'Kung Pao Chicken', price: 16, description: 'Spicy Sichuan dish with peanuts and vegetables', category: 'Main Course', chef: 'Chef Chen', rating: 4.3, image: '🥘', allergens: ['nuts'], cuisine: 'Chinese', diet: 'regular', restaurant_name: "Golden Dragon" },
  { id: 8, name: 'Pad Thai', price: 14, description: 'Traditional Thai stir-fried noodles', category: 'Main Course', chef: 'Chef Siriporn', rating: 4.4, image: '🍜', allergens: ['shellfish'], cuisine: 'Thai', diet: 'regular', restaurant_name: "Bangkok Garden" },
  { id: 9, name: 'Chicken Tikka Masala', price: 18, description: 'Creamy tomato curry with tender chicken', category: 'Main Course', chef: 'Chef Patel', rating: 4.6, image: '🍛', allergens: ['dairy'], cuisine: 'Indian', diet: 'regular', restaurant_name: "Spice Route" },
  { id: 10, name: 'Sushi Roll Combo', price: 24, description: 'Assorted fresh sushi rolls', category: 'Main Course', chef: 'Chef Tanaka', rating: 4.7, image: '🍣', allergens: ['fish'], cuisine: 'Japanese', diet: 'pescatarian', restaurant_name: "Tokyo Bay" },
  { id: 11, name: 'BBQ Burger', price: 16, description: 'Juicy beef burger with BBQ sauce', category: 'Main Course', chef: 'Chef Johnson', rating: 4.2, image: '🍔', allergens: ['gluten'], cuisine: 'American', diet: 'regular', restaurant_name: "American Grill" },
  { id: 12, name: 'Vegetable Spring Rolls', price: 8, description: 'Fresh vegetables wrapped in rice paper', category: 'Appetizer', chef: 'Chef Chen', rating: 4.1, image: '🥢', allergens: [], cuisine: 'Chinese', diet: 'vegan', restaurant_name: "Golden Dragon" },
];
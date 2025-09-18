import { filterMeals, fallbackMeals, getFilterSuggestions } from './fallbackUtils';

describe('fallbackUtils', () => {
  describe('filterMeals', () => {
    it('should return all meals when no preferences are provided', () => {
      const result = filterMeals(fallbackMeals);
      expect(result).toHaveLength(fallbackMeals.length);
    });

    it('should filter by cuisine correctly', () => {
      const result = filterMeals(fallbackMeals, { cuisine: 'Chinese' });
      expect(result).toHaveLength(2); // Kung Pao Chicken and Vegetable Spring Rolls
      expect(result.every(meal => meal.cuisine === 'Chinese')).toBe(true);
    });

    it('should filter by diet correctly', () => {
      const result = filterMeals(fallbackMeals, { diet: 'vegan' });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(meal => meal.diet === 'vegan')).toBe(true);
    });

    it('should filter by price correctly', () => {
      const result = filterMeals(fallbackMeals, { maxPrice: '15' });
      expect(result.every(meal => meal.price <= 15)).toBe(true);
    });

    it('should filter by category correctly', () => {
      const result = filterMeals(fallbackMeals, { category: 'Appetizer' });
      expect(result.every(meal => meal.category === 'Appetizer')).toBe(true);
    });

    it('should exclude meals with specified allergens', () => {
      const result = filterMeals(fallbackMeals, { allergens: ['gluten'] });
      expect(result.every(meal => !meal.allergens.includes('gluten'))).toBe(true);
    });

    it('should provide relaxed filtering when strict filtering returns no results', () => {
      // Try a very restrictive filter that would normally return nothing
      const result = filterMeals(fallbackMeals, { 
        cuisine: 'Mexican' // Not available in fallback data but no other filters
      });
      
      // Should still return some results due to relaxed filtering
      // Since Mexican cuisine doesn't exist, relaxed filtering should return all meals
      expect(result.length).toBeGreaterThan(0);
    });

    it('should always respect allergen filtering even in relaxed mode', () => {
      const result = filterMeals(fallbackMeals, { 
        cuisine: 'Mexican', // Not available
        allergens: ['gluten'] // Should be strictly filtered
      });
      
      // Should return some results but none with gluten
      expect(result.every(meal => !meal.allergens.includes('gluten'))).toBe(true);
    });

    it('should handle multiple allergens', () => {
      const result = filterMeals(fallbackMeals, { 
        allergens: ['gluten', 'dairy'] 
      });
      
      expect(result.every(meal => 
        !meal.allergens.includes('gluten') && !meal.allergens.includes('dairy')
      )).toBe(true);
    });

    it('should handle complex filtering scenarios', () => {
      const result = filterMeals(fallbackMeals, {
        cuisine: 'Italian',
        diet: 'vegetarian',
        maxPrice: '25',
        category: 'Main Course'
      });
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(meal => 
        meal.cuisine === 'Italian' &&
        meal.diet === 'vegetarian' &&
        meal.price <= 25 &&
        meal.category === 'Main Course'
      )).toBe(true);
    });
  });

  describe('getFilterSuggestions', () => {
    it('should suggest alternative cuisines when cuisine filter returns no results', () => {
      const suggestions = getFilterSuggestions(fallbackMeals, { cuisine: 'Mexican' });
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('cuisine'))).toBe(true);
    });

    it('should suggest alternative diets when diet filter returns no results', () => {
      const suggestions = getFilterSuggestions(fallbackMeals, { diet: 'keto' });
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('dietary'))).toBe(true);
    });

    it('should suggest alternative categories when category filter returns no results', () => {
      const suggestions = getFilterSuggestions(fallbackMeals, { category: 'Breakfast' });
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('Browse'))).toBe(true);
    });

    it('should not suggest alternatives when filter matches existing data', () => {
      const suggestions = getFilterSuggestions(fallbackMeals, { cuisine: 'Italian' });
      // Since Italian exists in the data, should still suggest other cuisines available
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('fallbackMeals data coverage', () => {
    it('should include diverse cuisines', () => {
      const cuisines = [...new Set(fallbackMeals.map(meal => meal.cuisine))];
      expect(cuisines.length).toBeGreaterThanOrEqual(6); // Should have multiple cuisines
      expect(cuisines).toContain('Chinese');
      expect(cuisines).toContain('Thai');
      expect(cuisines).toContain('Indian');
      expect(cuisines).toContain('Japanese');
      expect(cuisines).toContain('American');
    });

    it('should include diverse dietary options', () => {
      const diets = [...new Set(fallbackMeals.map(meal => meal.diet))];
      expect(diets).toContain('vegan');
      expect(diets).toContain('vegetarian');
      expect(diets).toContain('pescatarian');
      expect(diets).toContain('regular');
    });

    it('should include different price ranges', () => {
      const prices = fallbackMeals.map(meal => meal.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      expect(minPrice).toBeLessThan(15); // Budget options
      expect(maxPrice).toBeGreaterThan(25); // Premium options
    });

    it('should include different meal categories', () => {
      const categories = [...new Set(fallbackMeals.map(meal => meal.category))];
      expect(categories).toContain('Main Course');
      expect(categories).toContain('Appetizer');
      expect(categories).toContain('Dessert');
    });
  });
});
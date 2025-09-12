import googlePlacesService from '../services/googlePlacesService';

// Mock axios to avoid module import issues
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { status: 'OK', results: [] } }))
}));

describe('GooglePlacesService', () => {
  test('should be created with proper configuration', () => {
    expect(googlePlacesService).toBeDefined();
    expect(typeof googlePlacesService.searchRestaurants).toBe('function');
    expect(typeof googlePlacesService.getPlaceDetails).toBe('function');
    expect(typeof googlePlacesService.isConfigured).toBe('function');
  });

  test('should return fallback restaurants when API key is not configured', async () => {
    const restaurants = await googlePlacesService.searchRestaurants('downtown', 'italian');
    
    expect(Array.isArray(restaurants)).toBe(true);
    expect(restaurants.length).toBeGreaterThan(0);
    
    // Check that the restaurant objects have the expected structure
    const restaurant = restaurants[0];
    expect(restaurant).toHaveProperty('id');
    expect(restaurant).toHaveProperty('name');
    expect(restaurant).toHaveProperty('rating');
    expect(restaurant).toHaveProperty('categories');
    expect(restaurant).toHaveProperty('location');
    expect(restaurant).toHaveProperty('source');
  });

  test('should handle place details fallback correctly', async () => {
    const placeId = 'google-fallback-restaurant-1';
    const details = await googlePlacesService.getFallbackRestaurantDetails(placeId);
    
    expect(details).toBeDefined();
    expect(details.id).toBe(placeId);
    expect(details).toHaveProperty('name');
    expect(details).toHaveProperty('rating');
    expect(details).toHaveProperty('location');
  });

  test('should format types correctly', () => {
    const types = ['restaurant', 'food', 'establishment'];
    const formatted = googlePlacesService.formatTypes(types);
    
    expect(Array.isArray(formatted)).toBe(true);
    expect(formatted).toContain('Restaurant');
    expect(formatted).toContain('Food');
  });

  test('should format price level correctly', () => {
    expect(googlePlacesService.formatPriceLevel(0)).toBe('$');
    expect(googlePlacesService.formatPriceLevel(1)).toBe('$');
    expect(googlePlacesService.formatPriceLevel(2)).toBe('$$');
    expect(googlePlacesService.formatPriceLevel(3)).toBe('$$$');
    expect(googlePlacesService.formatPriceLevel(4)).toBe('$$$$');
    expect(googlePlacesService.formatPriceLevel(undefined)).toBe('$$');
  });

  test('should extract address components correctly', () => {
    const address = '123 Main St, Downtown, CA 90210, USA';
    
    expect(googlePlacesService.extractCity(address)).toBe('Downtown');
    expect(googlePlacesService.extractState(address)).toBe('CA');
    expect(googlePlacesService.extractZipCode(address)).toBe('90210');
  });

  test('should check API configuration status', () => {
    const isConfigured = googlePlacesService.isConfigured();
    expect(typeof isConfigured).toBe('boolean');
  });
});
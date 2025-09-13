import googlePlacesService from '../services/googlePlacesService';

// Mock axios to avoid module import issues
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { status: 'OK', results: [] } }))
}));

describe('GooglePlacesService', () => {
  beforeEach(() => {
    // Clear cache before each test
    googlePlacesService.clearCache();
  });

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

  // New tests for enhanced functionality
  test('should validate search parameters', async () => {
    // Should throw error for invalid location
    await expect(googlePlacesService.searchRestaurants('')).rejects.toThrow('Location parameter is required');
    await expect(googlePlacesService.searchRestaurants(null)).rejects.toThrow('Location parameter is required');
    
    // Should throw error for invalid radius
    await expect(googlePlacesService.searchRestaurants('downtown', 'restaurant', -1)).rejects.toThrow('Radius must be a number between 1 and 50000');
    await expect(googlePlacesService.searchRestaurants('downtown', 'restaurant', 60000)).rejects.toThrow('Radius must be a number between 1 and 50000');
  });

  test('should validate place details parameters', async () => {
    // Should throw error for invalid place ID
    await expect(googlePlacesService.getPlaceDetails('')).rejects.toThrow('Place ID is required');
    await expect(googlePlacesService.getPlaceDetails(null)).rejects.toThrow('Place ID is required');
  });

  test('should validate coordinates for nearby search', async () => {
    // Should throw error for invalid coordinates
    await expect(googlePlacesService.nearbySearch(-91, 0)).rejects.toThrow('Latitude must be a number between -90 and 90');
    await expect(googlePlacesService.nearbySearch(91, 0)).rejects.toThrow('Latitude must be a number between -90 and 90');
    await expect(googlePlacesService.nearbySearch(0, -181)).rejects.toThrow('Longitude must be a number between -180 and 180');
    await expect(googlePlacesService.nearbySearch(0, 181)).rejects.toThrow('Longitude must be a number between -180 and 180');
  });

  test('should handle caching correctly', async () => {
    const location = 'downtown';
    const query = 'pizza';
    
    // First call should miss cache (fallback doesn't use cache)
    const result1 = await googlePlacesService.searchRestaurants(location, query);
    expect(result1).toBeDefined();
    
    // Test cache manually by setting and getting
    const testKey = 'test:key';
    const testData = { test: 'data' };
    googlePlacesService._setCache(testKey, testData);
    
    const cachedData = googlePlacesService._getFromCache(testKey);
    expect(cachedData).toEqual(testData);
    
    const stats = googlePlacesService.getCacheStats();
    expect(stats.cacheHitRate).toBeGreaterThan(0);
  });

  test('should provide service status', () => {
    const status = googlePlacesService.getServiceStatus();
    
    expect(status).toHaveProperty('isAvailable');
    expect(status).toHaveProperty('apiKey');
    expect(status).toHaveProperty('requestsToday');
    expect(status).toHaveProperty('dailyLimit');
    expect(status).toHaveProperty('activeRequests');
    expect(status).toHaveProperty('cache');
  });

  test('should clear cache correctly', async () => {
    // Manually add some data to cache
    googlePlacesService._setCache('test:key1', { data: 'test1' });
    googlePlacesService._setCache('test:key2', { data: 'test2' });
    
    let stats = googlePlacesService.getCacheStats();
    expect(stats.totalEntries).toBeGreaterThan(0);
    
    // Clear cache
    googlePlacesService.clearCache();
    
    stats = googlePlacesService.getCacheStats();
    expect(stats.totalEntries).toBe(0);
  });

  test('should cancel requests correctly', () => {
    // Test request cancellation methods exist and don't throw
    expect(() => googlePlacesService.cancelRequest('test-id')).not.toThrow();
    expect(() => googlePlacesService.cancelAllRequests()).not.toThrow();
  });

  test('should generate photo URLs correctly', () => {
    const photo = { photo_reference: 'test-ref' };
    const url = googlePlacesService.getPhotoUrl(photo);
    
    expect(url).toContain('photo?maxwidth=');
    expect(url).toContain('photoreference=');
    
    // Should return emoji for invalid photo
    expect(googlePlacesService.getPhotoUrl(null)).toBe('🍽️');
    expect(googlePlacesService.getPhotoUrl({})).toBe('🍽️');
  });

  test('should handle formatPlacesData with invalid input', () => {
    expect(googlePlacesService.formatPlacesData(null)).toEqual([]);
    expect(googlePlacesService.formatPlacesData(undefined)).toEqual([]);
    expect(googlePlacesService.formatPlacesData('not-array')).toEqual([]);
  });

  test('should handle formatPlaceDetails with invalid input', () => {
    expect(googlePlacesService.formatPlaceDetails(null)).toBeNull();
    expect(googlePlacesService.formatPlaceDetails(undefined)).toBeNull();
    expect(googlePlacesService.formatPlaceDetails('not-object')).toBeNull();
  });
});
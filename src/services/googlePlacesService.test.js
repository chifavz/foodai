import googlePlacesService from './googlePlacesService';
import axios from 'axios';

// Clear mocks before each test
jest.mock('axios');

describe('GooglePlacesService', () => {
  beforeEach(() => {
    googlePlacesService.clearCache();
    jest.clearAllMocks();
  });

  test('should be created with proper configuration', () => {
    expect(googlePlacesService).toBeDefined();
    expect(typeof googlePlacesService.searchRestaurants).toBe('function');
    expect(typeof googlePlacesService.getPlaceDetails).toBe('function');
    expect(typeof googlePlacesService.isConfigured).toBe('function');
  });

  describe('Fallback behavior', () => {
    test('should return fallback restaurants when API key is not configured', async () => {
      const restaurants = await googlePlacesService.getFallbackRestaurants('downtown', 'italian');
      expect(Array.isArray(restaurants)).toBe(true);
      expect(restaurants.length).toBeGreaterThan(0);
      const restaurant = restaurants[0];
      expect(restaurant).toHaveProperty('id');
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('rating');
      expect(restaurant).toHaveProperty('categories');
      expect(restaurant).toHaveProperty('location');
      expect(restaurant).toHaveProperty('source');
    });

    test('should return fallback details for a known place ID', async () => {
      const placeId = 'google-fallback-restaurant-1';
      const details = googlePlacesService.getFallbackRestaurantDetails(placeId);
      expect(details).toBeDefined();
      expect(details.id).toBe(placeId);
      expect(details).toHaveProperty('name');
      expect(details).toHaveProperty('rating');
      expect(details).toHaveProperty('location');
    });
  });

  describe('API response behavior', () => {
    test('should format API results correctly', async () => {
      // Mock axios to return a non-empty result
      axios.get.mockResolvedValueOnce({
        data: {
          results: [
            {
              place_id: '1',
              name: 'Test Restaurant',
              types: ['restaurant', 'food'],
              geometry: { location: { lat: 10, lng: 20 } },
              formatted_address: '123 Main St, Downtown, CA 90210, USA'
            }
          ]
        }
      });

      const restaurants = await googlePlacesService.searchRestaurants('downtown', 'restaurant');
      expect(restaurants.length).toBe(1);
      const restaurant = restaurants[0];
      expect(restaurant.name).toBe('Test Restaurant');
      expect(restaurant.categories).toContain('Restaurant');
      expect(restaurant.coordinates).toEqual({ latitude: 10, longitude: 20 });
    });

    test('should use fallback when backend returns empty results', async () => {
      axios.get.mockResolvedValueOnce({ data: { results: [] } });
      const restaurants = await googlePlacesService.searchRestaurants('downtown', 'italian');
      expect(restaurants.some(r => r.source === 'google_places_fallback')).toBe(true);
    });

    test('should use fallback when backend request fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));
      const restaurants = await googlePlacesService.searchRestaurants('downtown', 'italian');
      expect(restaurants.some(r => r.source === 'google_places_fallback')).toBe(true);
    });
  });

  describe('Parameter validation', () => {
    test('should throw error for invalid location', async () => {
      await expect(googlePlacesService.searchRestaurants('')).rejects.toThrow('Location parameter is required');
      await expect(googlePlacesService.searchRestaurants(null)).rejects.toThrow('Location parameter is required');
    });

    test('should throw error for invalid radius', async () => {
      expect(() => googlePlacesService._validateSearchParams('downtown', 'restaurant', -1)).toThrow('Radius must be a number between 1 and 50000');
    });
  });
});

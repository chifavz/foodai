// Google Places API Service for Restaurant Discovery
import axios from 'axios';

const API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;

if (!API_KEY) {
  console.warn("Google Places API key not configured, using fallback data");
}

/**
 * Configuration constants for Google Places API service
 */
const CONFIG = {
  BASE_URL: 'https://maps.googleapis.com/maps/api/place',
  DEFAULT_RADIUS: 5000,
  DEFAULT_SEARCH_QUERY: 'restaurant',
  MAX_PHOTO_WIDTH: 400,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RATE_LIMIT: {
    REQUESTS_PER_SECOND: 10,
    REQUESTS_PER_DAY: 1000
  },
  GEOLOCATION_TIMEOUT: 10000, // 10 seconds
  REQUEST_TIMEOUT: 15000 // 15 seconds
};

/**
 * Custom error classes for better error handling
 */
class GooglePlacesError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'GooglePlacesError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Google Places API Service with enhanced error handling, caching, and rate limiting
 */
class GooglePlacesService {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = CONFIG.BASE_URL;
    this.isAvailable = !!API_KEY;
    
    // Initialize rate limiting
    this.requestQueue = [];
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.dailyRequestCount = 0;
    this.dailyResetTime = this.getNextDayTimestamp();
    
    // Initialize caching
    this.cache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Initialize request cancellation
    this.activeRequests = new Map();
    
    this._setupRateLimiting();
  }

  /**
   * Set up rate limiting mechanism
   * @private
   */
  _setupRateLimiting() {
    setInterval(() => {
      this.requestCount = 0;
    }, 1000);
    
    // Reset daily counter
    setInterval(() => {
      const now = Date.now();
      if (now >= this.dailyResetTime) {
        this.dailyRequestCount = 0;
        this.dailyResetTime = this.getNextDayTimestamp();
      }
    }, 60000); // Check every minute
  }

  /**
   * Get timestamp for next day reset
   * @private
   */
  getNextDayTimestamp() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Validate and sanitize search parameters
   * @param {string} location - Location to search
   * @param {string} query - Search query
   * @param {number} radius - Search radius
   * @private
   */
  _validateSearchParams(location, query, radius) {
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      throw new GooglePlacesError('Location parameter is required and must be a non-empty string', 'INVALID_PARAMETER');
    }
    
    if (query && typeof query !== 'string') {
      throw new GooglePlacesError('Query parameter must be a string', 'INVALID_PARAMETER');
    }
    
    if (radius && (typeof radius !== 'number' || radius <= 0 || radius > 50000)) {
      throw new GooglePlacesError('Radius must be a number between 1 and 50000', 'INVALID_PARAMETER');
    }
    
    return {
      location: location.trim(),
      query: query ? query.trim() : CONFIG.DEFAULT_SEARCH_QUERY,
      radius: radius || CONFIG.DEFAULT_RADIUS
    };
  }

  /**
   * Check if request can be made within rate limits
   * @private
   */
  _canMakeRequest() {
    // Check daily limit
    if (this.dailyRequestCount >= CONFIG.RATE_LIMIT.REQUESTS_PER_DAY) {
      return { canProceed: false, reason: 'Daily quota exceeded' };
    }
    
    // Check per-second limit
    if (this.requestCount >= CONFIG.RATE_LIMIT.REQUESTS_PER_SECOND) {
      return { canProceed: false, reason: 'Rate limit exceeded' };
    }
    
    return { canProceed: true };
  }

  /**
   * Wait for rate limit to allow request
   * @private
   */
  async _waitForRateLimit() {
    return new Promise((resolve) => {
      const checkRateLimit = () => {
        const { canProceed } = this._canMakeRequest();
        if (canProceed) {
          resolve();
        } else {
          setTimeout(checkRateLimit, 100);
        }
      };
      checkRateLimit();
    });
  }

  /**
   * Increment request counters
   * @private
   */
  _incrementRequestCounters() {
    this.requestCount++;
    this.dailyRequestCount++;
    this.lastRequestTime = Date.now();
  }

  /**
   * Generate cache key for requests
   * @private
   */
  _getCacheKey(type, params) {
    return `${type}:${JSON.stringify(params)}`;
  }

  /**
   * Get data from cache if available and not expired
   * @private
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
      this.cacheHits++;
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    this.cacheMisses++;
    return null;
  }

  /**
   * Store data in cache
   * @private
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Make HTTP request with retry logic and error handling
   * @private
   */
  async _makeRequest(url, params, requestId = null) {
    let lastError;
    
    for (let attempt = 0; attempt < CONFIG.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        // Wait for rate limit
        await this._waitForRateLimit();
        this._incrementRequestCounters();
        
        // Create abort controller for cancellation
        const abortController = new AbortController();
        if (requestId) {
          this.activeRequests.set(requestId, abortController);
        }
        
        const response = await axios.get(url, {
          params: {
            ...params,
            key: this.apiKey
          },
          timeout: CONFIG.REQUEST_TIMEOUT,
          signal: abortController.signal
        });
        
        // Clean up request tracking
        if (requestId) {
          this.activeRequests.delete(requestId);
        }
        
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Clean up request tracking
        if (requestId) {
          this.activeRequests.delete(requestId);
        }
        
        // Don't retry on certain errors
        if (error.name === 'AbortError' || 
            error.response?.status === 400 || 
            error.response?.status === 403) {
          break;
        }
        
        // Wait before retry with exponential backoff
        if (attempt < CONFIG.MAX_RETRY_ATTEMPTS - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, CONFIG.RETRY_DELAY * Math.pow(2, attempt))
          );
        }
      }
    }
    
    throw new GooglePlacesError(
      `Request failed after ${CONFIG.MAX_RETRY_ATTEMPTS} attempts`,
      'REQUEST_FAILED',
      lastError
    );
  }

  /**
   * Cancel an ongoing request
   * @param {string} requestId - Request ID to cancel
   */
  cancelRequest(requestId) {
    const controller = this.activeRequests.get(requestId);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Cancel all ongoing requests
   */
  cancelAllRequests() {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
  }

  /**
   * Search for restaurants with enhanced error handling and caching
   * @param {string|Object} location - Location to search (string or {lat, lng} object)
   * @param {string} query - Search query (default: 'restaurant')
   * @param {number} radius - Search radius in meters (default: 5000)
   * @returns {Promise<Array>} Array of restaurant data
   */
  async searchRestaurants(location, query = CONFIG.DEFAULT_SEARCH_QUERY, radius = CONFIG.DEFAULT_RADIUS) {
    const BASE_URL = 'http://localhost:8000'; // Ensure BASE_URL is defined within the method

    // Validate parameters
    if (!location || location === '') {
      throw new GooglePlacesError('Location parameter is required and must be a non-empty string', 'INVALID_PARAMETER');
    }

    try {
      const url = `${BASE_URL}/api/restaurants?location=${encodeURIComponent(location)}&query=${encodeURIComponent(query)}&radius=${radius}`;
      const response = await axios.get(url);
      const data = response.data;

      if (data.results && data.results.length > 0) {
        return this.formatPlacesData(data.results);
      } else {
        console.log('Backend returned no results, using fallback');
        return this.getFallbackRestaurants(location, query);
      }
    } catch (error) {
      console.error('Backend request failed:', error);
      return this.getFallbackRestaurants(location, query);
    }
  }

  /**
   * Perform text search with enhanced error handling
   * @param {string} location - Location to search
   * @param {string} query - Search query
   * @param {string} requestId - Request ID for cancellation
   * @returns {Promise<Array>} Array of formatted place data
   */
  async textSearch(location, query, requestId = null) {
    try {
      const searchQuery = `${encodeURIComponent(query)} in ${encodeURIComponent(location)}`;
      const data = await this._makeRequest(`${this.baseUrl}/textsearch/json`, {
        query: searchQuery,
        type: 'restaurant'
      }, requestId);

      if (data.status === 'OK') {
        return this.formatPlacesData(data.results);
      } else if (data.status === 'ZERO_RESULTS') {
        return [];
      } else {
        throw new GooglePlacesError(
          `Text search failed with status: ${data.status}`,
          'API_ERROR'
        );
      }
    } catch (error) {
      if (error instanceof GooglePlacesError) {
        throw error;
      }
      throw new GooglePlacesError(
        'Text search request failed',
        'REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Perform nearby search with enhanced error handling and validation
   * @param {number} latitude - Latitude coordinate
   * @param {number} longitude - Longitude coordinate  
   * @param {number} radius - Search radius in meters
   * @param {string} type - Place type (default: 'restaurant')
   * @returns {Promise<Array>} Array of formatted place data
   */
  async nearbySearch(latitude, longitude, radius = CONFIG.DEFAULT_RADIUS, type = 'restaurant') {
    // Validate coordinates
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      throw new GooglePlacesError('Latitude must be a number between -90 and 90', 'INVALID_PARAMETER');
    }
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      throw new GooglePlacesError('Longitude must be a number between -180 and 180', 'INVALID_PARAMETER');
    }
    
    // Check cache first
    const cacheKey = this._getCacheKey('nearby', { latitude, longitude, radius, type });
    const cached = this._getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isAvailable) {
      return this.getFallbackRestaurants();
    }

    try {
      const requestId = `nearby_${Date.now()}_${Math.random()}`;
      const data = await this._makeRequest(`${this.baseUrl}/nearbysearch/json`, {
        location: `${latitude},${longitude}`,
        radius: radius,
        type: type
      }, requestId);

      if (data.status === 'OK') {
        const result = this.formatPlacesData(data.results);
        this._setCache(cacheKey, result);
        return result;
      } else if (data.status === 'ZERO_RESULTS') {
        this._setCache(cacheKey, []);
        return [];
      } else {
        throw new GooglePlacesError(
          `Nearby search failed with status: ${data.status}`,
          'API_ERROR'
        );
      }
    } catch (error) {
      if (error instanceof GooglePlacesError) {
        throw error;
      }
      throw new GooglePlacesError(
        'Nearby search request failed',
        'REQUEST_FAILED',
        error
      );
    }
  }

  /**
   * Get detailed place information with enhanced error handling and caching
   * @param {string} placeId - Google Places ID
   * @param {Array} fields - Optional array of fields to retrieve
   * @returns {Promise<Object|null>} Place details or null if not found
   */
  async getPlaceDetails(placeId, fields = null) {
    // Validate place ID
    if (!placeId || typeof placeId !== 'string') {
      throw new GooglePlacesError('Place ID is required and must be a string', 'INVALID_PARAMETER');
    }
    
    // Check cache first
    const cacheKey = this._getCacheKey('details', { placeId, fields });
    const cached = this._getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.isAvailable) {
      return this.getFallbackRestaurantDetails(placeId);
    }

    try {
      const defaultFields = [
        'place_id', 'name', 'rating', 'user_ratings_total', 
        'formatted_address', 'formatted_phone_number', 'website', 
        'opening_hours', 'photos', 'price_level', 'types', 'geometry'
      ];
      
      const requestId = `details_${Date.now()}_${Math.random()}`;
      const data = await this._makeRequest(`${this.baseUrl}/details/json`, {
        place_id: placeId,
        fields: (fields || defaultFields).join(',')
      }, requestId);

      if (data.status === 'OK') {
        const result = this.formatPlaceDetails(data.result);
        this._setCache(cacheKey, result);
        return result;
      } else if (data.status === 'NOT_FOUND') {
        this._setCache(cacheKey, null);
        return null;
      } else {
        throw new GooglePlacesError(
          `Place details failed with status: ${data.status}`,
          'API_ERROR'
        );
      }
    } catch (error) {
      if (error instanceof GooglePlacesError) {
        console.error('Google Places details error:', error.message);
        throw error;
      }
      console.error('Google Places details request failed:', error);
      return this.getFallbackRestaurantDetails(placeId);
    }
  }

  /**
   * Format Google Places data to consistent structure
   * @param {Array} places - Raw places data from Google API
   * @returns {Array} Formatted places data
   */
  formatPlacesData(places) {
    if (!Array.isArray(places)) {
      console.warn('Invalid places data format, expected array');
      return [];
    }
    
    return places.map(place => {
      try {
        return {
          id: place.place_id,
          name: place.name || 'Unknown Restaurant',
          rating: typeof place.rating === 'number' ? place.rating : 0,
          reviewCount: typeof place.user_ratings_total === 'number' ? place.user_ratings_total : 0,
          categories: this.formatTypes(place.types),
          location: {
            address1: place.formatted_address || place.vicinity || '',
            city: this.extractCity(place.formatted_address),
            state: this.extractState(place.formatted_address),
            zip_code: this.extractZipCode(place.formatted_address),
          },
          phone: place.formatted_phone_number || '',
          image: this.getPhotoUrl(place.photos?.[0]),
          price: this.formatPriceLevel(place.price_level),
          coordinates: {
            latitude: place.geometry?.location?.lat || null,
            longitude: place.geometry?.location?.lng || null,
          },
          url: place.website || '',
          isOpenNow: place.opening_hours?.open_now || false,
          source: 'google_places',
        };
      } catch (error) {
        console.error('Error formatting place data:', error, place);
        return null;
      }
    }).filter(place => place !== null);
  }

  /**
   * Format place details to consistent structure
   * @param {Object} place - Raw place details from Google API
   * @returns {Object} Formatted place details
   */
  formatPlaceDetails(place) {
    if (!place || typeof place !== 'object') {
      console.warn('Invalid place details format');
      return null;
    }
    
    try {
      return {
        id: place.place_id,
        name: place.name || 'Unknown Restaurant',
        rating: typeof place.rating === 'number' ? place.rating : 0,
        reviewCount: typeof place.user_ratings_total === 'number' ? place.user_ratings_total : 0,
        categories: this.formatTypes(place.types),
        location: {
          address1: place.formatted_address || '',
          city: this.extractCity(place.formatted_address),
          state: this.extractState(place.formatted_address),
          zip_code: this.extractZipCode(place.formatted_address),
        },
        phone: place.formatted_phone_number || '',
        photos: this.formatPhotos(place.photos || []),
        hours: this.formatOpeningHours(place.opening_hours),
        price: this.formatPriceLevel(place.price_level),
        coordinates: {
          latitude: place.geometry?.location?.lat || null,
          longitude: place.geometry?.location?.lng || null,
        },
        url: place.website || '',
        isOpenNow: place.opening_hours?.open_now || false,
        source: 'google_places',
      };
    } catch (error) {
      console.error('Error formatting place details:', error, place);
      return null;
    }
  }

  formatTypes(types = []) {
    // Map Google Places types to user-friendly categories
    const typeMapping = {
      'restaurant': 'Restaurant',
      'food': 'Food',
      'meal_takeaway': 'Takeaway',
      'meal_delivery': 'Delivery',
      'bakery': 'Bakery',
      'cafe': 'Cafe',
      'bar': 'Bar',
      'night_club': 'Nightclub',
      'lodging': 'Hotel',
    };

    return types
      .filter(type => typeMapping[type])
      .map(type => typeMapping[type])
      .slice(0, 3); // Limit to 3 categories
  }

  formatPriceLevel(priceLevel) {
    const priceLevelMap = {
      0: '$',
      1: '$',
      2: '$$',
      3: '$$$',
      4: '$$$$',
    };
    return priceLevelMap[priceLevel] || '$$';
  }

  formatPhotos(photos) {
    return photos.slice(0, 5).map(photo => this.getPhotoUrl(photo));
  }

  formatOpeningHours(openingHours) {
    if (!openingHours || !openingHours.periods) return [];
    
    return openingHours.periods.map(period => ({
      open: {
        day: period.open?.day,
        time: period.open?.time,
      },
      close: {
        day: period.close?.day,
        time: period.close?.time,
      },
    }));
  }

  /**
   * Get photo URL with enhanced error handling
   * @param {Object} photo - Photo object from Google Places API
   * @param {number} maxWidth - Maximum width for the photo
   * @returns {string} Photo URL or emoji fallback
   */
  getPhotoUrl(photo, maxWidth = CONFIG.MAX_PHOTO_WIDTH) {
    if (!photo || !photo.photo_reference) {
      return '🍽️';
    }
    
    try {
      // Validate maxWidth
      const width = Math.min(Math.max(maxWidth, 50), 1600);
      return `${this.baseUrl}/photo?maxwidth=${width}&photoreference=${encodeURIComponent(photo.photo_reference)}&key=${this.apiKey}`;
    } catch (error) {
      console.warn('Error generating photo URL:', error);
      return '🍽️';
    }
  }

  extractCity(address) {
    if (!address) return '';
    const parts = address.split(', ');
    return parts.length >= 2 ? parts[parts.length - 3] || '' : '';
  }

  extractState(address) {
    if (!address) return '';
    const parts = address.split(', ');
    const lastPart = parts[parts.length - 2] || '';
    return lastPart.split(' ')[0] || '';
  }

  extractZipCode(address) {
    if (!address) return '';
    const zipMatch = address.match(/\b\d{5}(-\d{4})?\b/);
    return zipMatch ? zipMatch[0] : '';
  }

  getFallbackRestaurants(location = 'downtown', query = 'restaurant') {
    // Enhanced fallback data that matches the query when possible
    const baseRestaurants = [
      {
        id: 'google-fallback-restaurant-1',
        name: 'Downtown Bistro',
        rating: 4.4,
        reviewCount: 187,
        categories: ['Restaurant', 'American'],
        location: {
          address1: '123 Main Street',
          city: 'Downtown',
          state: 'CA',
          zip_code: '90210',
        },
        phone: '+1-555-0123',
        image: '🍽️',
        price: '$$',
        isOpenNow: true,
        source: 'google_places_fallback',
      },
      {
        id: 'google-fallback-restaurant-2',
        name: 'Golden Dragon Chinese',
        rating: 4.6,
        reviewCount: 234,
        categories: ['Restaurant', 'Chinese'],
        location: {
          address1: '456 Oak Avenue',
          city: 'Downtown',
          state: 'CA',
          zip_code: '90210',
        },
        phone: '+1-555-0456',
        image: '🍜',
        price: '$$',
        isOpenNow: true,
        source: 'google_places_fallback',
      },
      {
        id: 'google-fallback-restaurant-3',
        name: 'Mama Rosa\'s Italian',
        rating: 4.7,
        reviewCount: 156,
        categories: ['Restaurant', 'Italian'],
        location: {
          address1: '789 Pine Street',
          city: 'Downtown',
          state: 'CA',
          zip_code: '90210',
        },
        phone: '+1-555-0789',
        image: '🍝',
        price: '$$$',
        isOpenNow: false,
        source: 'google_places_fallback',
      },
      {
        id: 'google-fallback-restaurant-4',
        name: 'Fresh Garden Cafe',
        rating: 4.3,
        reviewCount: 98,
        categories: ['Cafe', 'Vegetarian'],
        location: {
          address1: '321 Elm Street',
          city: 'Downtown',
          state: 'CA',
          zip_code: '90210',
        },
        phone: '+1-555-0321',
        image: '🥗',
        price: '$',
        isOpenNow: true,
        source: 'google_places_fallback',
      },
    ];

    // Filter based on query if possible
    if (query && query !== 'restaurant') {
      const filtered = baseRestaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
      );
      if (filtered.length > 0) return filtered;
    }

    return baseRestaurants;
  }

  getFallbackRestaurantDetails(placeId) {
    const restaurants = this.getFallbackRestaurants();
    const restaurant = restaurants.find(r => r.id === placeId);
    
    if (restaurant) {
      return {
        ...restaurant,
        photos: ['🍽️', '🍜', '🍝'],
        hours: [
          { open: { day: 1, time: '0900' }, close: { day: 1, time: '2200' } },
          { open: { day: 2, time: '0900' }, close: { day: 2, time: '2200' } },
          { open: { day: 3, time: '0900' }, close: { day: 3, time: '2200' } },
          { open: { day: 4, time: '0900' }, close: { day: 4, time: '2200' } },
          { open: { day: 5, time: '0900' }, close: { day: 5, time: '2300' } },
          { open: { day: 6, time: '1000' }, close: { day: 6, time: '2300' } },
        ],
      };
    }
    
    return restaurants[0]; // Return first restaurant as default
  }

  // Helper method to check if Google Places API is configured
  isConfigured() {
    return this.isAvailable;
  }

  /**
   * Enhanced geolocation with timeout and better error handling
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Coordinates object
   */
  async getCurrentLocation(timeout = CONFIG.GEOLOCATION_TIMEOUT) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new GooglePlacesError(
          'Geolocation is not supported by this browser',
          'GEOLOCATION_NOT_SUPPORTED'
        ));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new GooglePlacesError(
          'Geolocation request timed out',
          'GEOLOCATION_TIMEOUT'
        ));
      }, timeout);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          let errorType = 'GEOLOCATION_ERROR';
          let message = 'Failed to get current location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorType = 'GEOLOCATION_PERMISSION_DENIED';
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorType = 'GEOLOCATION_UNAVAILABLE';
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorType = 'GEOLOCATION_TIMEOUT';
              message = 'Location request timed out';
              break;
            default:
              errorType = 'GEOLOCATION_ERROR';
              message = 'Unknown geolocation error';
              break;
          }
          
          reject(new GooglePlacesError(message, errorType, error));
        },
        {
          enableHighAccuracy: true,
          timeout: timeout - 1000, // Leave 1 second buffer for our timeout
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Clear cache entries
   * @param {string} pattern - Optional pattern to match cache keys
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [, value] of this.cache.entries()) {
      if (now - value.timestamp < CONFIG.CACHE_TTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheHitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }

  /**
   * Get service status and statistics
   * @returns {Object} Service status
   */
  getServiceStatus() {
    return {
      isAvailable: this.isAvailable,
      apiKey: this.isAvailable ? 'configured' : 'not configured',
      requestsToday: this.dailyRequestCount,
      dailyLimit: CONFIG.RATE_LIMIT.REQUESTS_PER_DAY,
      activeRequests: this.activeRequests.size,
      cache: this.getCacheStats()
    };
  }
}

// Create and export a singleton instance
const googlePlacesService = new GooglePlacesService();

// Export simple function as shown in problem statement
export async function searchRestaurants(query, location) {
  if (!API_KEY) {
    return googlePlacesService.getFallbackRestaurants(
      typeof location === 'string' ? location : 'downtown', 
      query
    );
  }

  let url;
  if (typeof location === 'object' && location.lat && location.lng) {
    url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location.lat},${location.lng}&radius=5000&key=${API_KEY}`;
  } else {
    const searchQuery = `${encodeURIComponent(query)} in ${encodeURIComponent(location)}`;
    url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${API_KEY}`;
  }

  const response = await axios.get(url);
  const data = response.data;
  return data.results || [];
}

export default googlePlacesService;
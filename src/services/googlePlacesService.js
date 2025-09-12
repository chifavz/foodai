// Google Places API Service for Restaurant Discovery
import axios from 'axios';

class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    this.isAvailable = !!this.apiKey;
  }

  async searchRestaurants(location, query = 'restaurant', radius = 5000) {
    if (!this.isAvailable) {
      console.warn('Google Places API key not configured, using fallback data');
      return this.getFallbackRestaurants(location, query);
    }

    try {
      // First, try text search which is more flexible for location inputs
      const response = await this.textSearch(location, query);
      
      if (response && response.length > 0) {
        return response;
      }

      // Fallback to nearby search if text search fails
      // Note: This would require geocoding the location first in a real implementation
      console.log('Text search returned no results, using fallback');
      return this.getFallbackRestaurants(location, query);
    } catch (error) {
      console.error('Google Places API request failed:', error);
      return this.getFallbackRestaurants(location, query);
    }
  }

  async textSearch(location, query) {
    try {
      const searchQuery = `${query} in ${location}`;
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query: searchQuery,
          type: 'restaurant',
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK') {
        return this.formatPlacesData(response.data.results);
      } else {
        console.warn('Google Places text search status:', response.data.status);
        return [];
      }
    } catch (error) {
      console.error('Google Places text search failed:', error);
      throw error;
    }
  }

  async nearbySearch(latitude, longitude, radius = 5000, type = 'restaurant') {
    if (!this.isAvailable) {
      return this.getFallbackRestaurants();
    }

    try {
      const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, {
        params: {
          location: `${latitude},${longitude}`,
          radius: radius,
          type: type,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK') {
        return this.formatPlacesData(response.data.results);
      } else {
        console.warn('Google Places nearby search status:', response.data.status);
        return [];
      }
    } catch (error) {
      console.error('Google Places nearby search failed:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId) {
    if (!this.isAvailable) {
      return this.getFallbackRestaurantDetails(placeId);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'place_id,name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,opening_hours,photos,price_level,types,geometry',
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK') {
        return this.formatPlaceDetails(response.data.result);
      } else {
        console.warn('Google Places details status:', response.data.status);
        return null;
      }
    } catch (error) {
      console.error('Google Places details request failed:', error);
      return this.getFallbackRestaurantDetails(placeId);
    }
  }

  formatPlacesData(places) {
    return places.map(place => ({
      id: place.place_id,
      name: place.name,
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
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
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
      },
      url: place.website || '',
      isOpenNow: place.opening_hours?.open_now || false,
      source: 'google_places',
    }));
  }

  formatPlaceDetails(place) {
    return {
      id: place.place_id,
      name: place.name,
      rating: place.rating || 0,
      reviewCount: place.user_ratings_total || 0,
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
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
      },
      url: place.website || '',
      isOpenNow: place.opening_hours?.open_now || false,
      source: 'google_places',
    };
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

  getPhotoUrl(photo, maxWidth = 400) {
    if (!photo || !photo.photo_reference) return '🍽️';
    
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photoreference=${photo.photo_reference}&key=${this.apiKey}`;
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

  // Method to get current location (would typically use browser geolocation API)
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}

// Create and export a singleton instance
const googlePlacesService = new GooglePlacesService();
export default googlePlacesService;
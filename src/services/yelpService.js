// Yelp Fusion API Service for Restaurant Discovery
import axios from 'axios';

class YelpService {
  constructor() {
    this.apiKey = process.env.REACT_APP_YELP_API_KEY;
    this.baseUrl = 'https://api.yelp.com/v3';
    this.isAvailable = !!this.apiKey;
  }

  async searchBusinesses(location, term = 'restaurants', limit = 20) {
    if (!this.isAvailable) {
      console.warn('Yelp API key not configured, using fallback data');
      return this.getFallbackRestaurants();
    }

    try {
      const response = await axios.get(`${this.baseUrl}/businesses/search`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params: {
          location,
          term,
          limit,
          categories: 'restaurants',
        },
      });

      return this.formatBusinessData(response.data.businesses);
    } catch (error) {
      console.error('Yelp API request failed:', error);
      return this.getFallbackRestaurants();
    }
  }

  async getBusinessDetails(businessId) {
    if (!this.isAvailable) {
      return this.getFallbackRestaurantDetails(businessId);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/businesses/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return this.formatBusinessDetails(response.data);
    } catch (error) {
      console.error('Yelp business details request failed:', error);
      return this.getFallbackRestaurantDetails(businessId);
    }
  }

  formatBusinessData(businesses) {
    return businesses.map(business => ({
      id: business.id,
      name: business.name,
      rating: business.rating,
      reviewCount: business.review_count,
      categories: business.categories.map(cat => cat.title),
      location: business.location,
      phone: business.phone,
      image: business.image_url,
      price: business.price || '$$',
      coordinates: business.coordinates,
      url: business.url,
      isOpenNow: business.is_closed === false,
    }));
  }

  formatBusinessDetails(business) {
    return {
      id: business.id,
      name: business.name,
      rating: business.rating,
      reviewCount: business.review_count,
      categories: business.categories.map(cat => cat.title),
      location: business.location,
      phone: business.phone,
      photos: business.photos || [],
      hours: business.hours?.[0]?.open || [],
      specialHours: business.special_hours || [],
      price: business.price || '$$',
      coordinates: business.coordinates,
      url: business.url,
      isOpenNow: business.is_closed === false,
      attributes: business.attributes || {},
    };
  }

  async getBusinessReviews(businessId) {
    if (!this.isAvailable) {
      console.warn('Yelp API key not configured, using fallback reviews');
      return this.getFallbackReviews(businessId);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/businesses/${businessId}/reviews`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return {
        reviews: response.data.reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          text: review.text,
          timeCreated: review.time_created,
          user: {
            id: review.user.id,
            name: review.user.name,
            profileUrl: review.user.profile_url,
            imageUrl: review.user.image_url,
          },
        })),
        total: response.data.total,
        possibleLanguages: response.data.possible_languages,
      };
    } catch (error) {
      console.error('Yelp reviews request failed:', error);
      return this.getFallbackReviews(businessId);
    }
  }

  getFallbackReviews(businessId) {
    return {
      reviews: [
        {
          id: 'fallback-review-1',
          rating: 5,
          text: 'Amazing food and great service! The chef really knows how to create memorable dishes.',
          timeCreated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          user: {
            id: 'user-1',
            name: 'Sarah M.',
            profileUrl: null,
            imageUrl: null
          }
        },
        {
          id: 'fallback-review-2', 
          rating: 4,
          text: 'Really enjoyed the meal here. Fresh ingredients and creative presentation.',
          timeCreated: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          user: {
            id: 'user-2',
            name: 'Mike D.',
            profileUrl: null,
            imageUrl: null
          }
        },
        {
          id: 'fallback-review-3',
          rating: 5,
          text: 'Outstanding experience from start to finish. Will definitely be back!',
          timeCreated: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          user: {
            id: 'user-3',
            name: 'Jennifer L.',
            profileUrl: null,
            imageUrl: null
          }
        }
      ],
      total: 3,
      possibleLanguages: ['en']
    };
  }

  getFallbackRestaurants() {
    return [
      {
        id: 'fallback-restaurant-1',
        name: 'Bella Vista Italian',
        rating: 4.5,
        reviewCount: 234,
        categories: ['Italian', 'Fine Dining'],
        location: {
          address1: '123 Main St',
          city: 'Downtown',
          state: 'CA',
          zip_code: '90210',
        },
        phone: '+1-555-0123',
        image: '🍝',
        price: '$$$',
        isOpenNow: true,
      },
      {
        id: 'fallback-restaurant-2',
        name: 'Tokyo Sushi Bar',
        rating: 4.8,
        reviewCount: 156,
        categories: ['Japanese', 'Sushi'],
        location: {
          address1: '456 Oak Ave',
          city: 'Downtown',
          state: 'CA',
          zip_code: '90210',
        },
        phone: '+1-555-0456',
        image: '🍣',
        price: '$$$$',
        isOpenNow: true,
      },
    ];
  }

  getFallbackRestaurantDetails(businessId) {
    const restaurants = this.getFallbackRestaurants();
    return restaurants.find(r => r.id === businessId) || restaurants[0];
  }

  // Helper method to check if Yelp API is configured
  isConfigured() {
    return this.isAvailable;
  }
}

// Create and export a singleton instance
const yelpService = new YelpService();
export default yelpService;
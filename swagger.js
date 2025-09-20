const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FoodAI Restaurant API',
      version: '1.0.0',
      description: 'API for restaurant discovery and menu integration using Yelp Fusion API',
      contact: {
        name: 'FoodAI Team',
        email: 'api@foodai.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.foodai.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Restaurant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the restaurant'
            },
            name: {
              type: 'string',
              description: 'Name of the restaurant'
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5,
              description: 'Restaurant rating (0-5 stars)'
            },
            reviewCount: {
              type: 'integer',
              description: 'Number of reviews'
            },
            categories: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'List of cuisine categories'
            },
            location: {
              type: 'object',
              properties: {
                address1: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zip_code: { type: 'string' },
                country: { type: 'string' }
              },
              description: 'Restaurant location details'
            },
            phone: {
              type: 'string',
              description: 'Restaurant phone number'
            },
            photos: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              description: 'Array of photo URLs'
            },
            price: {
              type: 'string',
              enum: ['$', '$$', '$$$', '$$$$'],
              description: 'Price range indicator'
            },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number', format: 'float' },
                longitude: { type: 'number', format: 'float' }
              },
              description: 'Geographic coordinates'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'Yelp page URL'
            },
            isOpenNow: {
              type: 'boolean',
              description: 'Whether the restaurant is currently open'
            },
            distanceInMeters: {
              type: 'number',
              format: 'float',
              description: 'Distance from search location in meters'
            }
          },
          required: ['id', 'name', 'rating', 'categories', 'location']
        },
        RestaurantSearchResponse: {
          type: 'object',
          properties: {
            restaurants: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Restaurant'
              }
            },
            total: {
              type: 'integer',
              description: 'Total number of restaurants found'
            },
            location: {
              type: 'string',
              description: 'Search location'
            }
          }
        },
        ReviewResponse: {
          type: 'object',
          properties: {
            reviews: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  text: { type: 'string' },
                  timeCreated: { type: 'string', format: 'date-time' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      imageUrl: { type: 'string', format: 'uri' }
                    }
                  }
                }
              }
            },
            total: { type: 'integer' },
            possibleLanguages: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              description: 'Service health status'
            },
            service: {
              type: 'string',
              description: 'Service name'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of health check'
            },
            apiConfigured: {
              type: 'boolean',
              description: 'Whether Yelp API is properly configured'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Additional error details'
            }
          },
          required: ['error']
        }
      }
    }
  },
  apis: ['./yelpMenuExample.js'], // Path to the API file
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FoodAI Restaurant API Documentation'
  })
};
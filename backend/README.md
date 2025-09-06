# Restaurant Aggregator Backend

This backend provides the restaurant aggregator API that enables direct partnerships with restaurants instead of relying on third-party delivery platforms.

## Features

- **Direct Restaurant Partnerships**: Work directly with 5 partner restaurants
- **AI-Powered Meal Filtering**: Filter meals by cuisine, diet, price, category, and allergens
- **RESTful API**: Clean endpoints for meal discovery and restaurant management
- **No Third-Party Dependencies**: Direct data integration, no external delivery platforms

## API Endpoints

### Core Endpoints

- `GET /api/health` - Health check
- `GET /api/meals` - Get filtered meals based on preferences
- `GET /api/restaurants` - Get all partner restaurants
- `GET /api/restaurants/:id` - Get specific restaurant details

### Meal Filtering

```javascript
// Filter meals by preferences
GET /api/meals?cuisine=Italian&diet=vegetarian&maxPrice=25&category=Main Course&allergens=gluten

// Example response:
{
  "meals": [
    {
      "id": 5,
      "name": "Margherita Pizza",
      "price": 22,
      "cuisine": "Italian",
      "diet": "vegetarian",
      "restaurant_name": "Antonio's Pizza Place",
      "allergens": ["gluten", "dairy"]
    }
  ],
  "total": 1,
  "filters_applied": {
    "cuisine": "Italian",
    "diet": "vegetarian", 
    "maxPrice": "25"
  }
}
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Development mode (with auto-restart):**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8000`

## Partner Restaurants

The system currently partners with 5 restaurants:

1. **Chef Mario's Italian Kitchen** - Italian cuisine
2. **Isabella's Fine Dining** - French cuisine  
3. **Antonio's Pizza Place** - Italian cuisine
4. **Garden Fresh Vegetarian** - Vegetarian cuisine
5. **Sakura Japanese Cuisine** - Japanese cuisine

## Data Model

Each meal includes:
- Restaurant information
- Dietary classification (regular, vegetarian, vegan, pescatarian)
- Cuisine type
- Allergen information
- Pricing and ratings
- Chef details

## Architecture

This is a **referral/AI matching service**, not a delivery platform. The system:

1. Aggregates meals from partner restaurants
2. Uses AI to match meals to user preferences
3. Connects users directly with restaurants for ordering
4. Manages no delivery logistics - pure referral service

## Environment

The backend runs independently and can be deployed separately from the frontend. No external API keys required for basic functionality.
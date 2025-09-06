# Backend Integration Documentation

## Overview

The FoodAI frontend has been enhanced with multiple API integrations including the `chifavz/aifoodback` backend, Yelp Fusion API for restaurant discovery, and menu APIs (ChowNow/OpenMenu) for structured menu data. The integration includes a robust API service layer that provides fallback to localStorage when external services are not available.

## Backend Connection Configuration

### Environment Variables

Create a `.env` file in the root directory with the following configuration:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=https://api.aifoodback.example.com

# External API Integrations
REACT_APP_YELP_API_KEY=your_yelp_api_key_here
REACT_APP_CHOWNOW_API_KEY=your_chownow_api_key_here
REACT_APP_OPENMENU_API_KEY=your_openmenu_api_key_here

# Affiliate Program Configuration
REACT_APP_AFFILIATE_ID=your_affiliate_id_here
REACT_APP_UBEREATS_AFFILIATE_ID=your_ubereats_affiliate_id_here
REACT_APP_DOORDASH_AFFILIATE_ID=your_doordash_affiliate_id_here
```

### API Service

The application now includes a comprehensive API service (`src/services/api.js`) that handles:

- Automatic backend availability detection
- Fallback to localStorage when backend is unavailable
- Consistent error handling and retries
- **NEW**: Yelp Fusion API integration for restaurant discovery
- **NEW**: Menu API integration (ChowNow/OpenMenu) for structured menu data
- **NEW**: Enhanced affiliate workflow with proper tracking

## API Endpoints

The frontend now supports multiple API endpoints from different services:

### Core Backend APIs

- `GET /api/health` - Backend availability check
- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Save user profile
- `GET /api/menu/items` - Get all menu items
- `GET /api/cart` - Get current cart
- `POST /api/cart` - Save cart
- `DELETE /api/cart` - Clear cart
- `POST /api/orders` - Place new order
- `GET /api/orders/history` - Get order history
- `PUT /api/orders/{id}/rating` - Update order rating
- `POST /api/ai/chat` - Send message to AI assistant

### Yelp Fusion API Integration

- `searchRestaurants(location, term, limit)` - Search for restaurants by location
- `getRestaurantDetails(restaurantId)` - Get detailed restaurant information
- Automatic fallback to hardcoded restaurant data when API unavailable

### Menu API Integration (ChowNow/OpenMenu)

- `getRestaurantMenu(restaurantId, provider)` - Get structured menu data
- `searchMenuItems(restaurantId, searchTerm, provider)` - Search menu items
- Supports multiple providers: 'chownow', 'openmenu'
- Automatic fallback to demo menu when APIs unavailable

### Affiliate Integration

- Enhanced OrderButton component with affiliate link generation
- Support for Uber Eats, DoorDash, and Grubhub affiliate programs
- Automatic tracking and URL generation with affiliate IDs

## Data Models

### User Profile
```json
{
  "name": "string",
  "dietaryRestrictions": ["string"],
  "allergies": ["string"],
  "cuisinePreferences": ["string"],
  "goals": ["string"],
  "budgetRange": "string",
  "mealFrequency": "string"
}
```

### Menu Item
```json
{
  "id": "number",
  "name": "string",
  "price": "number",
  "description": "string",
  "category": "string",
  "chef": "string",
  "rating": "number",
  "image": "string"
}
```

### Cart Item
```json
{
  "id": "number",
  "name": "string",
  "price": "number",
  "quantity": "number",
  "chef": "string"
}
```

### Order
```json
{
  "id": "number",
  "date": "string",
  "time": "string",
  "items": [
    {
      "name": "string",
      "chef": "string",
      "price": "number",
      "rating": "number"
    }
  ],
  "total": "number",
  "status": "string",
  "deliveryMethod": "string",
  "rated": "boolean"
}
```

### AI Chat Request
```json
{
  "message": "string",
  "context": {
    "userProfile": "object",
    "conversationHistory": ["object"]
  }
}
```

## Fallback Behavior

When the backend is not available, the application automatically falls back to:
- **User Profile**: localStorage storage
- **Menu Items**: Hardcoded sample menu
- **Cart**: localStorage storage
- **Orders**: localStorage storage
- **AI Waitress**: Local response generation

## Features Integrated

### ✅ User Profile Management
- Profile creation and updates via API
- Fallback to localStorage when backend unavailable
- Loading states and error handling

### ✅ Menu Item Loading
- Dynamic menu loading from backend
- Fallback to sample menu items
- Automatic retry on errors

### ✅ Cart Management
- Real-time cart synchronization with backend
- Automatic local backup
- Seamless fallback behavior

### ✅ Order Processing
- Order placement through API
- Order history retrieval
- Rating and review system

### ✅ AI Waitress Integration
- Backend AI service integration
- Context-aware conversations
- Profile-based personalization
- Fallback to local responses

### ✅ External API Integration
- **NEW**: Yelp Fusion API for restaurant discovery
- **NEW**: ChowNow/OpenMenu integration for structured menu data
- **NEW**: Enhanced affiliate workflow with proper tracking
- Automatic fallback behavior for all external APIs

### ✅ Affiliate Program Integration
- **NEW**: OrderButton component with affiliate link generation
- **NEW**: Support for multiple delivery platforms (Uber Eats, DoorDash, Grubhub)
- **NEW**: Automatic affiliate URL generation with tracking
- **NEW**: Cart data integration for conversion tracking

### ✅ Loading States
- Global loading context
- Loading overlays and indicators
- Proper error messaging

## Testing the Integration

1. **With Backend Available**: 
   - Set correct API URLs in `.env`
   - All data flows through backend APIs
   - Check network tab for API calls

2. **Without Backend**: 
   - Application continues to work
   - Falls back to localStorage
   - Console shows fallback messages

## Development Setup

1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env`
3. Start development server: `npm start`
4. Build for production: `npm run build`

## Backend Requirements

The backend should implement:
- RESTful API design
- JSON request/response format
- CORS headers for frontend domain
- Error handling with appropriate HTTP status codes
- Authentication/session management (future enhancement)

## Future Enhancements

- [ ] Authentication and user sessions
- [ ] Real-time order status updates
- [ ] WebSocket integration for AI chat
- [ ] File upload for menu item images
- [ ] Advanced AI features with vector search
- [ ] Push notifications for order updates

## Error Handling

The API service includes comprehensive error handling:
- Network timeout detection
- Automatic fallback mechanisms
- User-friendly error messages
- Console logging for debugging
- Graceful degradation when services are unavailable

This integration ensures a seamless user experience whether the backend is available or not, while providing a robust foundation for full backend connectivity.
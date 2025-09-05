# Backend Integration Documentation

## Overview

The FoodAI frontend has been updated to support connection to the `chifavz/aifoodback` backend. The integration includes a robust API service layer that provides fallback to localStorage when the backend is not available.

## Backend Connection Configuration

### Environment Variables

Create a `.env` file in the root directory with the following configuration:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=https://api.aifoodback.example.com
```

### API Service

The application now includes a comprehensive API service (`src/services/api.js`) that handles:

- Automatic backend availability detection
- Fallback to localStorage when backend is unavailable
- Consistent error handling and retries

## API Endpoints

The frontend expects the following REST API endpoints from the backend:

### Health Check
- `GET /api/health` - Backend availability check

### User Profile
- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Save user profile

### Menu Management
- `GET /api/menu/items` - Get all menu items

### Cart Operations
- `GET /api/cart` - Get current cart
- `POST /api/cart` - Save cart
- `DELETE /api/cart` - Clear cart

### Order Management
- `POST /api/orders` - Place new order
- `GET /api/orders/history` - Get order history
- `PUT /api/orders/{id}/rating` - Update order rating

### AI Waitress
- `POST /api/ai/chat` - Send message to AI assistant

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
# Restaurant Discovery Backend API Fix

## Problem Solved
Fixed 404 error: `GET http://localhost:3000/api/restaurants?location=downtown&query=restaurants&radius=5000 404 (Not Found)`

## Solution
Created a complete backend API server that provides the missing `/api/restaurants` endpoint.

## Quick Start

### Start the Backend Server
```bash
npm run server
```

### Start the Frontend (separate terminal)
```bash
npm start
```

### Start Both Together
```bash
npm run dev
```

## API Endpoints

### Restaurant Search
```
GET /api/restaurants
```

**Parameters:**
- `location` (string): Location to search (e.g., "downtown", "seattle")
- `query` (string): Cuisine type or search term (e.g., "japanese", "restaurants")
- `radius` (number): Search radius in meters (default: 5000)
- `limit` (number): Maximum results to return (default: 20)

**Example:**
```bash
curl "http://localhost:3000/api/restaurants?location=downtown&query=japanese&radius=5000"
```

### Restaurant Details
```
GET /api/restaurants/:id
```

### Health Check
```
GET /api/health
```

### Partner Restaurants
```
GET /api/partner-restaurants
```

## How It Works

1. **React Development Server** (port 3000) proxies `/api/*` requests to the backend
2. **Express Backend Server** (port 8000) handles API requests and returns restaurant data
3. **Frontend components** can now call `/api/restaurants` without getting 404 errors

## Frontend Integration

The `googlePlacesService.js` has been updated to call the backend API when the Google Places API key is not configured:

```javascript
if (!API_KEY) {
  // Try to get restaurants from backend API
  const backendUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'}/restaurants`;
  const response = await axios.get(`${backendUrl}?${params.toString()}`);
  return response.data.restaurants;
}
```

## Testing

All endpoints are working correctly:
- ✅ Direct backend API calls
- ✅ Frontend proxy forwarding
- ✅ Restaurant search with filtering
- ✅ Health check endpoint

The Restaurant Discovery page now loads without any 404 errors and displays restaurant data from the backend API.
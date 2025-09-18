# Google Places API - Secure Backend Integration

This document explains how to set up the secure Google Places API integration that fixes referrer restriction issues.

## Problem Solved

**Before**: Frontend directly called Google Places API
- ❌ "API keys with referer restrictions cannot be used with this API" error
- ❌ API key exposed in browser requests
- ❌ Security vulnerabilities

**After**: Frontend → Backend → Google Places API
- ✅ No referrer restriction errors
- ✅ API key secured on server-side
- ✅ Works with any referrer restrictions
- ✅ Automatic fallback when backend unavailable

## Setup Instructions

### 1. Install Dependencies

The required backend dependencies are already included:
```bash
npm install express cors dotenv node-fetch
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Backend API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Backend API Keys (NEVER expose these to frontend)
GOOGLE_PLACES_API_KEY=your_actual_google_places_api_key_here
```

**Important**: 
- Use your **backend/server-restricted API key** for `GOOGLE_PLACES_API_KEY`
- Remove `REACT_APP_GOOGLE_PLACES_API_KEY` (no longer needed)
- The backend key should be restricted by server IP, not by referrer

### 3. Start the Application

**Option A: Start both frontend and backend together**
```bash
npm run dev
```

**Option B: Start separately**
```bash
# Terminal 1: Start backend (port 5000)
npm run server

# Terminal 2: Start frontend (port 3000)  
npm start
```

### 4. Test the Integration

**Backend Health Check**:
```bash
curl http://localhost:5000/api/health
```

**Test Places API** (with valid API key):
```bash
curl "http://localhost:5000/api/places?lat=37.7749&lng=-122.4194&query=restaurants"
```

## API Documentation

### Backend Endpoint: `/api/places`

**Method**: GET

**Parameters**:
- `lat` (required): Latitude coordinate
- `lng` (required): Longitude coordinate
- `radius` (optional): Search radius in meters (default: 1500)
- `type` (optional): Place type filter (default: 'restaurant')
- `query` (optional): Text search query

**Example Request**:
```
GET /api/places?lat=37.7749&lng=-122.4194&radius=2000&query=italian%20restaurants
```

**Response**: Array of restaurant objects from Google Places API

## Security Flow

```
[React Frontend] → [Express Backend] → [Google Places API]
     ↓                    ↓                      ↓
[User Browser]      [Server + API Key]     [Google Servers]
```

1. **Frontend**: Makes request to `/api/places` with coordinates
2. **Backend**: Validates parameters, adds API key, calls Google Places API
3. **Google**: Processes request using server-side key (no referrer restrictions)
4. **Backend**: Returns results to frontend
5. **Frontend**: Displays restaurant data

## Fallback Behavior

The system gracefully handles failures:

1. **Backend available + API key configured**: Uses Google Places API
2. **Backend available + no API key**: Returns error message
3. **Backend unavailable**: Falls back to hardcoded restaurant data
4. **Direct API call**: Only used as last resort if backend fails

## Production Deployment

### Environment Variables for Production

```env
# Production backend URL
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api

# Server-side Google Places API key
GOOGLE_PLACES_API_KEY=your_production_google_places_api_key

# Set NODE_ENV for Express
NODE_ENV=production
```

### API Key Restrictions

**For the backend API key**, use these restrictions:

✅ **Recommended**: Server IP address restrictions
```
Server IP addresses: 192.168.1.100, 203.0.113.10
```

❌ **Avoid**: HTTP referrer restrictions (causes the original problem)

### CORS Configuration

The backend automatically allows requests from:
- `http://localhost:3000` (development)
- `http://localhost:3001` (alternative development)

For production, update the CORS origins in `server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

## Troubleshooting

### Common Issues

**"Google Places API key not configured on server"**
- Check that `GOOGLE_PLACES_API_KEY` is set in `.env`
- Restart the backend server after changing environment variables

**"Backend Places API call failed"**
- Ensure backend server is running on port 5000
- Check `REACT_APP_API_BASE_URL` points to correct backend URL

**"API keys with referer restrictions cannot be used"**
- This error should no longer occur with the backend proxy
- If you see this, the frontend is bypassing the backend (check logs)

### Debug Mode

Enable debug logging by checking the browser console and backend server logs:

```bash
# Backend logs show API calls
npm run server

# Frontend logs show API call flow
# Open browser dev tools → Console
```

## Testing with Real API Key

1. Get a Google Places API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Restrict the key to your server IP (not referrer)
3. Enable "Places API" in Google Cloud Console
4. Add key to `.env` file as `GOOGLE_PLACES_API_KEY=your_key_here`
5. Restart backend: `npm run server`
6. Test: Navigate to the restaurant discovery page in the React app

The app will now make secure API calls through your backend, eliminating referrer restriction errors while keeping your API key safe.
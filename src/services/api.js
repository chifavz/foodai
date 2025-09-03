import axios from "axios";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints for the food personalization MVP

// User preferences
export const getPreferences = () => api.get("/preferences");
export const updatePreferences = (data) => api.put("/preferences", data);

// AI recommendations
export const getRecommendations = (preferences) => 
  api.post("/recommendations", preferences);
export const getMealRecommendations = (mealType, preferences) => 
  api.post(`/recommendations/${mealType}`, preferences);

// Orders
export const placeOrder = (orderData) => api.post("/orders", orderData);
export const getOrders = () => api.get("/orders");
export const getOrderById = (orderId) => api.get(`/orders/${orderId}`);
export const updateOrderStatus = (orderId, status) => 
  api.patch(`/orders/${orderId}/status`, { status });

// Chef/Menu management
export const getMenuItems = () => api.get("/menu");
export const createMenuItem = (itemData) => api.post("/menu", itemData);
export const updateMenuItem = (itemId, itemData) => 
  api.put(`/menu/${itemId}`, itemData);
export const deleteMenuItem = (itemId) => api.delete(`/menu/${itemId}`);

// Payments (Stripe integration)
export const createPaymentIntent = (amount, currency = "usd") => 
  api.post("/payments/intent", { amount, currency });
export const confirmPayment = (paymentIntentId) => 
  api.post("/payments/confirm", { paymentIntentId });

// Delivery tracking
export const getDeliveryStatus = (orderId) => 
  api.get(`/delivery/${orderId}/status`);
export const updateDeliveryStatus = (orderId, status, location) => 
  api.patch(`/delivery/${orderId}/status`, { status, location });

// Feedback and learning
export const submitFeedback = (orderId, rating, comments) => 
  api.post("/feedback", { orderId, rating, comments });
export const getFeedback = () => api.get("/feedback");

// AI Waiter chat
export const sendChatMessage = (message, context) => 
  api.post("/chat", { message, context });
export const getChatHistory = () => api.get("/chat/history");

// Analytics for chef dashboard
export const getAnalytics = (timeframe = "week") => 
  api.get(`/analytics?timeframe=${timeframe}`);
export const getPopularItems = () => api.get("/analytics/popular-items");
export const getCustomerInsights = () => api.get("/analytics/customer-insights");

export default api;
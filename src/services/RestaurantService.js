import apiService from './ApiService';

class RestaurantService {
  async getPartnerRestaurants() {
    try {
      return await apiService.request('/restaurants');
    } catch (error) {
      console.log('Fallback partner restaurants');
      return [
        { id: 1, name: "Chef Mario's Italian Kitchen", cuisine: "Italian", location: "Downtown", partnership_type: "direct" },
        { id: 2, name: "Isabella's Fine Dining", cuisine: "French", location: "Uptown", partnership_type: "direct" },
        { id: 3, name: "Antonio's Pizza Place", cuisine: "Italian", location: "Midtown", partnership_type: "direct" },
        { id: 4, name: "Garden Fresh Vegetarian", cuisine: "Vegetarian", location: "Downtown", partnership_type: "direct" },
        { id: 5, name: "Sakura Japanese Cuisine", cuisine: "Japanese", location: "Westside", partnership_type: "direct" }
      ];
    }
  }

  async getPartnerRestaurantDetails(restaurantId) {
    try {
      return await apiService.request(`/restaurants/${restaurantId}`);
    } catch (error) {
      console.log('Fallback restaurant details');
      return null;
    }
  }
}

const restaurantService = new RestaurantService();
export default restaurantService;
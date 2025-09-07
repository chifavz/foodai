import apiService from './ApiService';
import { fallbackMeals, filterMeals } from '../utils/fallbackUtils';

class MealService {
  async getMealsFiltered(preferences = {}) {
    try {
      const response = await apiService.request(`/meals?${new URLSearchParams(preferences).toString()}`);
      return filterMeals(response.meals || [], preferences);
    } catch (error) {
      console.log('Using fallback meals due to backend/API failure');
      return filterMeals(fallbackMeals, preferences);
    }
  }

  async getMenuItems(restaurantId = null, useExternalApi = false) {
    if (useExternalApi && restaurantId) {
      try {
        const menu = await apiService.menuApiService.getRestaurantMenu(restaurantId);
        return apiService.menuApiService.getAllMenuItems(menu);
      } catch (error) {
        console.log('External menu API failed, using fallback');
      }
    }

    try {
      const response = await apiService.request('/meals');
      return response.meals || fallbackMeals;
    } catch (error) {
      return fallbackMeals;
    }
  }
}

const mealService = new MealService();
export default mealService;
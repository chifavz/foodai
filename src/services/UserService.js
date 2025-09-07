import apiService from './ApiService';

class UserService {
  async getUserProfile() {
    try {
      return await apiService.request('/user/profile');
    } catch (error) {
      return JSON.parse(localStorage.getItem('userProfile') || '{}');
    }
  }

  async saveUserProfile(profile) {
    try {
      const result = await apiService.request('/user/profile', { method: 'POST', body: profile });
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return result;
    } catch (error) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      return profile;
    }
  }
}

const userService = new UserService();
export default userService;
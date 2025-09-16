// Test the ApiService class and its URL configuration
class ApiService {
  constructor(baseUrl = process.env.REACT_APP_API_BASE_URL) {
    this.baseUrl = baseUrl || 'http://localhost:8000/api';
  }
}

describe('ApiService', () => {
  // Clean up environment variable after each test
  const originalEnv = process.env.REACT_APP_API_BASE_URL;
  
  afterEach(() => {
    process.env.REACT_APP_API_BASE_URL = originalEnv;
  });

  describe('constructor', () => {
    it('should use provided baseUrl parameter', () => {
      const customUrl = 'https://api.example.com/v1';
      const apiService = new ApiService(customUrl);
      expect(apiService.baseUrl).toBe(customUrl);
    });

    it('should use environment variable when available', () => {
      process.env.REACT_APP_API_BASE_URL = 'https://env.example.com/api';
      const apiService = new ApiService();
      expect(apiService.baseUrl).toBe('https://env.example.com/api');
    });

    it('should fallback to http://localhost:8000/api when no baseUrl or env variable provided', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const apiService = new ApiService();
      expect(apiService.baseUrl).toBe('http://localhost:8000/api');
    });

    it('should fallback to http://localhost:8000/api when empty baseUrl and no env variable', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const apiService = new ApiService('');
      expect(apiService.baseUrl).toBe('http://localhost:8000/api');
    });

    it('should fallback to http://localhost:8000/api when null baseUrl and no env variable', () => {
      delete process.env.REACT_APP_API_BASE_URL;
      const apiService = new ApiService(null);
      expect(apiService.baseUrl).toBe('http://localhost:8000/api');
    });
  });
});

import apiService from './ApiService';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = (value || '').toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid-123'),
  },
  writable: true
});

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset crypto mock
    global.crypto.randomUUID.mockReturnValue('mock-uuid-123');
    fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  describe('constructor', () => {
    it('should use default baseUrl when no env var set', () => {
      expect(apiService.baseUrl).toMatch(/localhost:(5000|8000)\/api/);
    });
  });

  describe('session ID management', () => {
    it('should generate new session ID when none exists', async () => {
      await apiService.request('/test');

      expect(crypto.randomUUID).toHaveBeenCalled();
      expect(localStorage.getItem('sessionId')).toBe('mock-uuid-123');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Session-Id': 'mock-uuid-123',
          }),
        })
      );
    });

    it('should reuse existing session ID', async () => {
      localStorage.setItem('sessionId', 'existing-session-id');
      
      await apiService.request('/test');

      expect(crypto.randomUUID).not.toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Session-Id': 'existing-session-id',
          }),
        })
      );
    });
  });

  describe('token authentication', () => {
    it('should use Bearer token when available', async () => {
      localStorage.setItem('token', 'auth-token-123');
      localStorage.setItem('sessionId', 'session-123');

      await apiService.request('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer auth-token-123',
          }),
        })
      );
      
      // Should not include session ID when token is present
      const fetchCall = fetch.mock.calls[0][1];
      expect(fetchCall.headers).not.toHaveProperty('X-Session-Id');
    });

    it('should fall back to session ID when no token', async () => {
      localStorage.setItem('sessionId', 'session-123');

      await apiService.request('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Session-Id': 'session-123',
          }),
        })
      );
      
      // Should not include Authorization header
      const fetchCall = fetch.mock.calls[0][1];
      expect(fetchCall.headers).not.toHaveProperty('Authorization');
    });
  });

  describe('request method', () => {
    it('should include Content-Type header by default', async () => {
      await apiService.request('/test');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should merge custom headers with default headers', async () => {
      await apiService.request('/test', {
        headers: { 'Custom-Header': 'custom-value' },
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should stringify body when it is an object', async () => {
      const body = { data: 'test' };
      
      await apiService.request('/test', { body });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          body: '{"data":"test"}',
        })
      );
    });

    it('should not stringify body when it is already a string', async () => {
      const body = '{"data":"test"}';
      
      await apiService.request('/test', { body });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          body: '{"data":"test"}',
        })
      );
    });

    it('should throw error when response is not ok', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(apiService.request('/test')).rejects.toThrow('HTTP error! status: 404');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      fetch.mockRejectedValue(networkError);

      await expect(apiService.request('/test')).rejects.toThrow('Network error');

    });
  });
});
class ApiService {
  constructor(baseUrl = process.env.REACT_APP_API_BASE_URL) {
    // Ensure no trailing slash in base URL
    this.baseUrl = (baseUrl || "http://localhost:8000/api").replace(/\/+$/, "");
  }

  async request(endpoint, options = {}) {
    // Ensure no leading slash in endpoint
    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${cleanEndpoint}`;

    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage or other storage

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`; // Add Authorization header if token exists
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body !== "string") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;

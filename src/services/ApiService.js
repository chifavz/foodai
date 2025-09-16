function getSessionId() {
  let sid = localStorage.getItem("sessionId");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("sessionId", sid);
  }
  return sid;
}

class ApiService {
  constructor(baseUrl = process.env.REACT_APP_API_BASE_URL) {
    // Ensure no trailing slash in base URL
    this.baseUrl = (baseUrl || "http://localhost:8000/api").replace(/\/+$/, "");
  }

  async request(endpoint, options = {}) {
    // Ensure no leading slash in endpoint
    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const url = `${this.baseUrl}/${cleanEndpoint}`;

    // Attach token or sessionId
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : { "X-Session-Id": getSessionId() }),
      ...options.headers,
    };

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

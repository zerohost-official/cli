const axios = require('axios');

class ZeroHostAPI {
  constructor() {
    this.baseURL = process.env.ZEROHOST_BASE_URL || 'https://api.zerohost.net';
    this.apiKey = null;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ZeroHost-CLI/1.0.0'
      }
    });

    // Add request interceptor for API key
    this.client.interceptors.request.use((config) => {
      if (this.apiKey) {
        config.headers['X-API-Key'] = this.apiKey;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  async createShare(shareData) {
    try {
      const response = await this.client.post('/v1/share', shareData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create share: ${error.message}`);
    }
  }

  async getShare(shareId, password = null) {
    try {
      const config = {};
      if (password) {
        config.headers = { 'X-Password': password };
      }

      const response = await this.client.get(`/v1/share/${shareId}`, config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve share: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      // Test by trying to create a minimal share
      await this.createShare({
        text: 'CLI connection test',
        expires_in: '1h'
      });
      return true;
    } catch (testError) {
      throw new Error('API connection test failed');
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
      case 400:
        throw new Error(data.error || 'Invalid request');
      case 401:
        throw new Error('Authentication failed - check your API key');
      case 403:
        throw new Error('Access denied - upgrade your plan for this feature');
      case 429:
        throw new Error('Rate limit exceeded - please wait before trying again');
      case 500:
        throw new Error('Server error - please try again later');
      default:
        throw new Error(data.error || `HTTP ${status}: ${error.message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error - check your internet connection');
    } else {
      // Other error
      throw new Error(error.message);
    }
  }

  async getUsage() {
    if (!this.apiKey) {
      throw new Error('API key required for usage information');
    }

    try {
      const response = await this.client.get('/v1/usage');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get usage: ${error.message}`);
    }
  }

  async getActiveShares() {
    if (!this.apiKey) {
      throw new Error('API key required for active shares');
    }

    try {
      const response = await this.client.get('/v1/shares');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get active shares: ${error.message}`);
    }
  }

  async deleteShare(shareId) {
    if (!this.apiKey) {
      throw new Error('API key required to delete shares');
    }

    try {
      await this.client.delete(`/v1/share/${shareId}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete share: ${error.message}`);
    }
  }
}

module.exports = ZeroHostAPI;

// API Service for QuickShop Frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Authentication
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async demoLogin() {
    const response = await this.post('/auth/demo-login', {});
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  async getRecentOrders() {
    return this.get('/dashboard/recent-orders');
  }

  async getPopularProducts() {
    return this.get('/dashboard/popular-products');
  }

  async getUserStore() {
    return this.get('/dashboard/user-store');
  }

  async getUserStores() {
    return this.get('/dashboard/user-stores');
  }

  async getStoreSetupProgress(storeId) {
    return this.get(`/dashboard/setup-progress/${storeId}`);
  }

  // Notifications APIs
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async getUnreadNotificationsCount() {
    return this.get('/notifications/unread-count');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', { method: 'PATCH' });
  }

  async createNotification(notificationData) {
    return this.post('/notifications', notificationData);
  }

  // Store Users APIs
  async getStoreTeam(storeId) {
    return this.get(`/store-users/${storeId}/team`);
  }

  async inviteUserToStore(storeId, userData) {
    return this.post(`/store-users/${storeId}/invite`, userData);
  }

  async updateUserRole(storeId, userId, role) {
    return this.request(`/store-users/${storeId}/team/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }

  async removeUserFromStore(storeId, userId) {
    return this.delete(`/store-users/${storeId}/team/${userId}`);
  }

  // Products APIs
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Orders APIs
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  async updateOrderStatus(id, status) {
    return this.put(`/orders/${id}/status`, { status });
  }

  // Customers APIs
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/customers${queryString ? `?${queryString}` : ''}`);
  }

  async getCustomer(id) {
    return this.get(`/customers/${id}`);
  }

  // Analytics APIs
  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/analytics${queryString ? `?${queryString}` : ''}`);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

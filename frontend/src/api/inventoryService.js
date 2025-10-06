import api from './axios';

export const inventoryService = {
  // ============ PRODUCTOS ============
  getProducts: async () => {
    const response = await api.get('/api/products/');
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/api/products/${id}/`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/api/products/', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/api/products/${id}/`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/api/products/${id}/`);
    return response.data;
  },

  getLowStockProducts: async () => {
    const response = await api.get('/api/products/low_stock/');
    return response.data;
  },

  getProductsByCategory: async (category) => {
    const response = await api.get('/api/products/by_category/', {
      params: { category }
    });
    return response.data;
  },

  getProductStats: async (id) => {
    const response = await api.get(`/api/products/${id}/stats/`);
    return response.data;
  },

  // ============ TRANSACCIONES ============
  getTransactions: async (filters = {}) => {
    const response = await api.get('/api/transactions/', { params: filters });
    return response.data;
  },

  getTransaction: async (id) => {
    const response = await api.get(`/api/transactions/${id}/`);
    return response.data;
  },

  createTransaction: async (transactionData) => {
    const response = await api.post('/api/transactions/', transactionData);
    return response.data;
  },

  getRecentTransactions: async () => {
    const response = await api.get('/api/transactions/recent/');
    return response.data;
  },

  getUserTransactions: async () => {
    const response = await api.get('/api/transactions/by_user/');
    return response.data;
  },

  // ============ USUARIOS ============
  getUsers: async () => {
    const response = await api.get('/api/users/');
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/api/users/${id}/`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/users/me/');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}/`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}/`);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/api/users/update_profile/', userData);
    return response.data;
  },

  // ============ ROLES ============
  getRoles: async () => {
    const response = await api.get('/api/roles/');
    return response.data;
  },

  // ============ DASHBOARD ============
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats/');
    return response.data;
  },

  // ============ CHARTS ============
  getProductChartData: async (productId) => {
    const response = await api.get(`/charts/product/${productId}/`);
    return response.data;
  },

  getInventoryOverviewChart: async () => {
    const response = await api.get('/charts/inventory-overview/');
    return response.data;
  },

  getCategoryDistribution: async () => {
    const response = await api.get('/charts/category-distribution/');
    return response.data;
  }
};

import api from './axios';

export const authService = {
  // Login con JWT
  login: async (email, password) => {
    const response = await api.post('/auth/jwt/login/', {
      email,
      password
    });
    return response.data;
  },

  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout/');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return response.data;
  },

  // Refrescar token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/jwt/refresh/', {
      refresh: refreshToken
    });
    return response.data;
  }
};

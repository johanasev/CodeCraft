import axios from 'axios';

// En Docker, el frontend accede al backend a través de Nginx (mismo dominio)
// En desarrollo local, usa http://127.0.0.1:8000
const API_BASE_URL = window.location.hostname === 'localhost' && window.location.port === '5173'
  ? 'http://127.0.0.1:8000'  // Desarrollo local con Vite
  : '';  // Producción/Docker - usa el mismo dominio (Nginx proxy)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores y refrescar tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, {
          refresh: refreshToken
        });

        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar localStorage y redirigir a login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

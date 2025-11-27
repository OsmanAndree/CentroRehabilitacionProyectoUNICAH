import axios, { AxiosInstance } from 'axios';

/**
 * Configuración de la instancia de axios con interceptor para agregar token
 */
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Token inválido o sin permisos
      const message = error.response?.data?.message || 'No tienes autorización';
      console.error('Error de autorización:', message);
      
      // Si es un error de autenticación (no de permisos), redirigir al login
      if (message.includes('No tienes autorización') || message.includes('no autenticado')) {
        localStorage.removeItem('token');
        localStorage.removeItem('idRol');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


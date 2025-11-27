import axios from 'axios';

/**
 * Configuración global de Axios con interceptores
 * Agrega automáticamente el token de autorización a todas las peticiones
 */

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: 'http://localhost:3002/Api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request - Agregar token a todas las peticiones
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

// Interceptor de response - Manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el error es 401 o 403, redirigir al login
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Verificar si no estamos ya en la página de login
      if (window.location.pathname !== '/') {
        // Si es un error de permisos, mostrar mensaje
        if (error.response?.status === 403) {
          console.error('No tienes permisos para realizar esta acción');
        } else {
          // Token expirado o inválido
          localStorage.removeItem('token');
          localStorage.removeItem('idRol');
          localStorage.removeItem('permissions');
          localStorage.removeItem('permissionsByModule');
          localStorage.removeItem('roles');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('user');
          
          // Redirigir al login
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// También configurar axios global para peticiones que usen axios directamente
axios.interceptors.request.use(
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

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('idRol');
        localStorage.removeItem('permissions');
        localStorage.removeItem('permissionsByModule');
        localStorage.removeItem('roles');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);


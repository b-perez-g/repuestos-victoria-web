import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // No modificar las cookies aquí, el servidor ya las maneja correctamente
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Solo intentar refresh una vez por request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = Cookies.get('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('Intentando renovar token...');
        
        // Hacer request de refresh
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Cookie': `refreshToken=${refreshToken}`
            }
          }
        );
        
        if (response.data.success && response.data.token) {
          console.log('Token renovado exitosamente');
          
          // Actualizar header de la request original
          originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
          
          // Reintentar la request original
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }
      } catch (refreshError) {
        console.error('Error renovando token:', refreshError);
        
        // Limpiar tokens y redirigir
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Error handling para otros códigos de estado
    const message = error.response?.data?.message;
    
    switch (error.response?.status) {
      case 400:
        if (message && !originalRequest._skipToast) {
          toast.error(message);
        }
        break;
      case 401:
        if (!originalRequest._retry && !originalRequest._skipToast) {
          toast.error('Sesión expirada');
        }
        break;
      case 403:
        toast.error('No tienes permisos para esta acción');
        break;
      case 422:
        // No mostrar toast para errores de validación, se manejan en formularios
        break;
      case 423:
        toast.error('Cuenta bloqueada temporalmente');
        break;
      case 500:
        toast.error('Error del servidor. Intenta más tarde.');
        break;
      default:
        if (!originalRequest._skipToast) {
          toast.error(message || 'Ha ocurrido un error');
        }
    }

    return Promise.reject(error);
  }
);

export default api;
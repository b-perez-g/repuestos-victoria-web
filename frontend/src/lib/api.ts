// src/lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Crear instancia de axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    // Agregar token si existe
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Intentar renovar token
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
          refreshToken
        }, {
          withCredentials: true
        });
        
        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Guardar nuevos tokens
          Cookies.set('token', accessToken, {
            expires: 1,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
          
          if (newRefreshToken) {
            Cookies.set('refreshToken', newRefreshToken, {
              expires: 7,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
            });
          }

          // Actualizar header y reintentar petición original
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Redirigir a login si falla el refresh
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Manejo de errores comunes
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error;
      
      switch (error.response.status) {
        case 400:
          toast.error(message || 'Solicitud inválida');
          break;
        case 401:
          toast.error(message || 'Credenciales inválidas');
          break;
        case 403:
          toast.error('No tienes permisos para realizar esta acción');
          break;
        case 404:
          toast.error('Recurso no encontrado');
          break;
        case 422:
          toast.error(message || 'Datos de entrada inválidos');
          break;
        case 423:
          toast.error('Cuenta bloqueada temporalmente');
          break;
        case 500:
          toast.error('Error del servidor. Por favor intenta más tarde');
          break;
        default:
          toast.error(message || 'Ha ocurrido un error');
      }
    } else if (error.request) {
      toast.error('No se pudo conectar con el servidor');
    } else {
      toast.error('Ha ocurrido un error inesperado');
    }

    return Promise.reject(error);
  }
);

export default api;
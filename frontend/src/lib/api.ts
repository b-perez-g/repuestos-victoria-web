import axios from 'axios';
import toast from 'react-hot-toast';

// CSRF Token storage
let csrfToken: string | null = null;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // ✅ CRÍTICO para cookies
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API configurada para: process.env.NEXT_PUBLIC_API_URL

// Function to get CSRF token
export const getCSRFToken = async (endpoint: string = 'auth'): Promise<string | null> => {
  try {
    if (!csrfToken) {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}/csrf-token`,
        { withCredentials: true }
      );

      if (response.data.success) {
        csrfToken = response.data.csrfToken;
      }
    }
    return csrfToken;
  } catch (error) {
    return null;
  }
};

// Function to clear CSRF token
export const clearCSRFToken = () => {
  csrfToken = null;
};

// ✅ Request interceptor con CSRF
api.interceptors.request.use(
  async (config) => {
    // Add CSRF token for state-changing requests (except categories for now)
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      // Solo aplicar CSRF a rutas de auth, no a categories
      if (!config.url?.includes('/categories')) {
        const token = await getCSRFToken('auth');
        if (token) {
          config.headers['X-CSRF-Token'] = token;
        }
      }
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor simplificado
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;


    // ✅ Manejo de errores CSRF 403 - reintentar con nuevo token
    if (error.response?.status === 403 &&
        (error.response?.data?.code === 'CSRF_TOKEN_MISSING' ||
         error.response?.data?.code === 'CSRF_TOKEN_INVALID') &&
        !originalRequest._retryCSRF) {

      originalRequest._retryCSRF = true;


      // Limpiar token CSRF y obtener uno nuevo
      clearCSRFToken();
      const newToken = await getCSRFToken();

      if (newToken) {
        originalRequest.headers['X-CSRF-Token'] = newToken;
        return api(originalRequest);
      }
    }

    // ✅ Manejo de 401 - renovar token automáticamente
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Token expirado, renovando automáticamente...');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          console.log('✅ Token renovado exitosamente');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('❌ Error renovando token:', refreshError);
        // Clear CSRF token on auth failure
        clearCSRFToken();

        // No redirigir automáticamente - las páginas protegidas muestran 404
      }
    }

    // ✅ Error handling básico
    const message = error.response?.data?.message;
    const errorCode = error.response?.data?.code;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // No mostrar toast de error, las páginas protegidas mostrarán 404
    } else if (error.response?.status === 403) {
      // Handle CSRF token errors
      if (errorCode === 'CSRF_TOKEN_INVALID' || errorCode === 'CSRF_TOKEN_MISSING') {
        clearCSRFToken();
        // Don't show error toast for CSRF issues, just retry
      } else {
        toast.error('No tienes permisos para esta acción');
      }
    } else if (error.response?.status >= 500) {
      toast.error('Error del servidor');
    }

    return Promise.reject(error);
  }
);

export default api;
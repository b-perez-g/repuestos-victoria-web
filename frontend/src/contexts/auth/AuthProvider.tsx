'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext, User, AuthContextType, RegisterData } from './AuthContext';
import api, { clearCSRFToken } from '@/lib/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Función para verificar autenticación con el servidor
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/validate');

      if (response.data.success && response.data.user) {
        const userData: User = {
          id: response.data.user.id.toString(),
          email: response.data.user.email,
          name: `${response.data.user.firstName || ''} ${response.data.user.lastName || ''}`.trim(),
          role: response.data.user.role || 'cliente'
        };

        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (error: any) {
      setUser(null);
      return null;
    }
  }, []);

  const logout = async (): Promise<void> => {
    try {
      // Llamar al endpoint de logout
      await api.post('/auth/logout');

      // Limpiar estado local
      setUser(null);

      // Limpiar cookies y CSRF token
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      clearCSRFToken();

      toast.success('Sesión cerrada');
      router.push('/');
    } catch (error) {
      // Aunque falle el logout del servidor, limpiar localmente
      setUser(null);
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      clearCSRFToken();

      toast.success('Sesión cerrada');
      router.push('/');
    }
  };

  // ✅ Inicialización - verificar autenticación
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setLoading(false);
    };

    initAuth();
  }, [checkAuth]);

  // ✅ Renovación proactiva de token cada 30 minutos (solo si hay user activo)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        console.log('🔄 Renovando token proactivamente...');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.data.success) {
          console.log('✅ Token renovado exitosamente');
          // Verificar que el usuario siga siendo válido
          const userCheck = await api.get('/auth/validate');
          if (!userCheck.data.success || !userCheck.data.user) {
            console.log('⚠️ Usuario ya no válido después de renovación');
            await logout();
          }
        } else {
          console.log('❌ Error renovando token');
          await logout();
        }
      } catch (error: any) {
        console.log('❌ Error en renovación proactiva:', error.message);
        // Solo hacer logout si es un error de autenticación real
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          await logout();
        }
        // Para otros errores (red, etc.), no hacer logout
      }
    }, 1800000); // 30 minutos = 1800000ms

    return () => clearInterval(interval);
  }, [user, logout]);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe
      });

      if (response.data.success) {
        // Esperar un momento para que las cookies se establezcan
        await new Promise(resolve => setTimeout(resolve, 200));

        // Verificar autenticación
        const userData = await checkAuth();

        if (userData) {
          toast.success('Inicio de sesión exitoso');

          // Redireccionar
          setTimeout(() => {
            if (userData.role === 'admin') {
              router.push('/admin/dashboard');
            } else {
              router.push('/');
            }
          }, 100);
        } else {
          throw new Error('No se pudo establecer la sesión');
        }
      }
    } catch (error: any) {
      const response = error.response?.data;
      const message = response?.message || error.message || 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        toast.success('Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.');
        router.push(`/verify-account?email=${encodeURIComponent(userData.correo)}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Error al registrarse';
      toast.error(message);
      throw error;
    }
  };

  const resendVerification = async (email: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/resend-verification', {
        email: email.toLowerCase().trim()
      });

      if (response.data.success) {
        toast.success('Correo de verificación enviado exitosamente');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al enviar el correo de verificación';
      toast.error(message);
      return false;
    }
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    resendVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContext, User, AuthContextType, RegisterData } from './AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

// Función helper para decodificar JWT
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Función helper para verificar si un token ha expirado
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Función para extraer user data del token
  const getUserFromToken = useCallback((token: string): User | null => {
    const decoded = decodeJWT(token);
    if (!decoded) return null;

    return {
      id: decoded.id?.toString() || '',
      email: decoded.email || '',
      name: decoded.firstName && decoded.lastName ? 
        `${decoded.firstName} ${decoded.lastName}` : 
        decoded.firstName || decoded.email || '',
      role: decoded.role || 'cliente'
    };
  }, []);

  // Función para verificar el estado de autenticación
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 Verificando estado de autenticación...');
      const token = Cookies.get('token');
      
      if (!token) {
        console.log('❌ No hay token');
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      // Verificar si el token ha expirado
      if (isTokenExpired(token)) {
        console.log('⏰ Token expirado, intentando renovar...');
        try {
          const response = await api.post('/auth/refresh-token');
          if (response.data.success) {
            const newToken = Cookies.get('token');
            if (newToken) {
              const userData = getUserFromToken(newToken);
              console.log('✅ Token renovado, usuario:', userData);
              setUser(userData);
            }
          }
        } catch (refreshError) {
          console.log('❌ Error renovando token, limpiando cookies');
          Cookies.remove('token');
          Cookies.remove('refreshToken');
          setUser(null);
        }
      } else {
        // Token válido, extraer datos del usuario
        const userData = getUserFromToken(token);
        console.log('✅ Token válido, usuario:', userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [getUserFromToken]);

  // Inicializar autenticación solo una vez
  useEffect(() => {
    if (!isInitialized) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, isInitialized]);

  // Re-verificar cuando cambia la ruta (para casos edge)
  useEffect(() => {
    if (isInitialized && !loading) {
      const token = Cookies.get('token');
      const currentUser = user;
      
      // Si hay token pero no user, verificar
      if (token && !currentUser && !isTokenExpired(token)) {
        console.log('🔄 Detectado token sin usuario, re-verificando...');
        const userData = getUserFromToken(token);
        if (userData) {
          setUser(userData);
        }
      }
      
      // Si no hay token pero hay user, limpiar
      if (!token && currentUser) {
        console.log('🧹 No hay token pero hay usuario, limpiando...');
        setUser(null);
      }
    }
  }, [pathname, isInitialized, loading, user, getUserFromToken]);

  const login = async (correo: string, contrasena: string, recordar: boolean = false): Promise<void> => {
    try {
      console.log('🚪 Intentando login...', { correo, recordar });
      
      const response = await api.post('/auth/login', { 
        email: correo, 
        password: contrasena, 
        rememberMe: recordar 
      });
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        console.log('✅ Login exitoso:', userData);
        
        // Establecer usuario desde los datos de respuesta
        const newUser: User = {
          id: userData.id.toString(),
          email: userData.email,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
          role: userData.role || 'cliente'
        };
        
        // Establecer usuario inmediatamente
        setUser(newUser);
        
        // Verificar que las cookies se establecieron
        setTimeout(() => {
          const cookieToken = Cookies.get('token');
          console.log('🍪 Cookie establecida:', !!cookieToken);
          
          if (!cookieToken && token) {
            console.log('⚠️ Cookie no establecida, configurando manualmente');
            const cookieOptions = {
              expires: recordar ? 30 : 1,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict' as const
            };
            
            Cookies.set('token', token, cookieOptions);
            if (response.data.refreshToken) {
              Cookies.set('refreshToken', response.data.refreshToken, {
                ...cookieOptions,
                expires: recordar ? 30 : 7
              });
            }
          }
        }, 100);
        
        toast.success('Inicio de sesión exitoso');
        
        // Redireccionar después de establecer el usuario
        setTimeout(() => {
          if (userData.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }, 150);
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        toast.success('Cuenta creada exitosamente. Revisa tu email para verificar tu cuenta.');
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Cerrando sesión...');
      await api.post('/auth/logout');
    } catch (error) {
      console.error('⚠️ Error en logout del servidor:', error);
    } finally {
      // Limpiar estado local
      console.log('🧹 Limpiando cookies y estado');
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      setUser(null);
      toast.success('Sesión cerrada');
      router.push('/');
    }
  };

  const isAuthenticated = !!user;

  // Debug logs
  useEffect(() => {
    if (isInitialized) {
      console.log('🔐 Estado auth:', { 
        isAuthenticated, 
        hasUser: !!user, 
        loading, 
        userRole: user?.role,
        pathname 
      });
    }
  }, [isAuthenticated, user, loading, pathname, isInitialized]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
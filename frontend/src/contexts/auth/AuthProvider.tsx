// src/contexts/auth/AuthProvider.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AuthContext, User, AuthContextType } from './AuthContext';
import { 
  isAuthenticated as checkAuth, 
  getToken, 
  saveTokens, 
  clearTokens, 
  isTokenExpired, 
  decodeToken 
} from '@/lib/auth/cookies';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const initializeAuth = () => {
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        const decoded = decodeToken(token);
        if (decoded) {
          setUser({
            id: decoded.sub || decoded.id || '',
            email: decoded.email || '',
            name: decoded.name || decoded.username || '',
            role: decoded.role || ''
          });
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { accessToken, refreshToken, user: userData } = response.data;
        
        // Guardar tokens
        saveTokens(accessToken, refreshToken);
        
        // Establecer usuario
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        });
        
        toast.success('Inicio de sesión exitoso');
      }
    } catch (error: any) {
      // El error ya se maneja en el interceptor de api.ts
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    clearTokens();
    setUser(null);
    toast.success('Sesión cerrada');
    // Redireccionar al login
    window.location.href = '/login';
  };

  const isAuthenticated = !!user && checkAuth();

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
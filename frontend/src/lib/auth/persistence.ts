// src/lib/auth/persistence.ts

import Cookies from 'js-cookie';

/**
 * Verifica si hay una sesión persistente válida
 */
export const checkSessionPersistence = (): {
  hasToken: boolean;
  hasRefreshToken: boolean;
  shouldRestore: boolean;
} => {
  const token = Cookies.get('token');
  const refreshToken = Cookies.get('refreshToken');
  
  return {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    shouldRestore: !!(token || refreshToken)
  };
};

/**
 * Limpia completamente la sesión
 */
export const clearSession = (): void => {
  Cookies.remove('token', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
  
  // También limpiar con diferentes paths por si acaso
  Cookies.remove('token');
  Cookies.remove('refreshToken');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Sesión limpiada completamente');
  }
};

/**
 * Verifica si una cookie es de sesión (sin expiración) o persistente
 */
export const isSessionCookie = (cookieName: string): boolean => {
  const cookieString = document.cookie;
  const cookies = cookieString.split(';');
  
  for (const cookie of cookies) {
    const [name] = cookie.trim().split('=');
    if (name === cookieName) {
      // Si la cookie no tiene expires o max-age, es una cookie de sesión
      return !cookie.includes('expires') && !cookie.includes('max-age');
    }
  }
  
  return false;
};

/**
 * Obtiene información de la sesión actual
 */
export const getSessionInfo = () => {
  const persistence = checkSessionPersistence();
  
  return {
    ...persistence,
    isTemporarySession: persistence.hasToken ? isSessionCookie('token') : false,
    isPersistentSession: persistence.hasToken ? !isSessionCookie('token') : false
  };
};
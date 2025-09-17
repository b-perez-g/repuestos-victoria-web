// src/lib/auth/cookies.ts
import Cookies from 'js-cookie';

type DecodedToken = {
  exp: number;
  role?: string;
  [key: string]: any;
};

export const isAuthenticated = (): boolean => !!Cookies.get('token');

export const getToken = (): string | undefined => Cookies.get('token');

export const saveTokens = (accessToken: string, refreshToken?: string): void => {
  Cookies.set('token', accessToken, {
    expires: 1,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
};

export const clearTokens = (): void => {
  Cookies.remove('token');
  Cookies.remove('refreshToken');
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getUserFromToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;

  return decodeToken(token);
};

export const hasRole = (requiredRole: string): boolean => {
  const user = getUserFromToken();
  if (!user) return false;

  return user.role === requiredRole || user.role === 'admin';
};

export const hasAnyRole = (roles: string[]): boolean => {
  const user = getUserFromToken();
  if (!user) return false;

  return roles.includes(user.role || '');
};

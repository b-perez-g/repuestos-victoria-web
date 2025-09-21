import Cookies from 'js-cookie';

type DecodedToken = {
  exp: number;
  id?: string;
  sub?: string;
  email?: string;
  role?: string;
  name?: string;
  username?: string;
  nombre?: string;
  apellido?: string;
  iat?: number;
  [key: string]: any;
};

export const isAuthenticated = (): boolean => {
  const token = Cookies.get('token');
  if (!token) return false;
  
  // Verificar si el token no está expirado
  return !isTokenExpired(token);
};

export const getToken = (): string | undefined => Cookies.get('token');

export const getRefreshToken = (): string | undefined => Cookies.get('refreshToken');

export const saveTokens = (accessToken: string, refreshToken?: string): void => {
  const cookieOptions = {
    expires: 1, // 1 día
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  Cookies.set('token', accessToken, cookieOptions);

  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: 7, // 7 días
    });
  }
};

export const clearTokens = (): void => {
  Cookies.remove('token');
  Cookies.remove('refreshToken');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getTokenPayload = (): DecodedToken | null => {
  const token = getToken();
  if (!token) return null;
  
  return decodeToken(token);
};

export const getUserFromToken = (): any => {
  const payload = getTokenPayload();
  if (!payload) return null;
  
  return {
    id: payload.id || payload.sub,
    email: payload.email,
    name: payload.name || payload.username || payload.nombre,
    role: payload.role,
    firstName: payload.nombre,
    lastName: payload.apellido
  };
};

export const isTokenNearExpiry = (token: string, minutesBeforeExpiry: number = 5): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = decoded.exp - (minutesBeforeExpiry * 60);
    
    return currentTime >= expiryTime;
  } catch (error) {
    console.error('Error checking token near expiry:', error);
    return true;
  }
};
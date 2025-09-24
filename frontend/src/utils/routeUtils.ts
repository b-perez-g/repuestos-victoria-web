// src/utils/routeUtils.ts

/**
 * Define qué rutas son completamente públicas (no requieren autenticación)
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-account',
  '/contact',
  '/about',
  '/products',
  '/categories',
  // Agregar más rutas públicas según necesites
];

/**
 * Define rutas que requieren autenticación
 */
export const PROTECTED_ROUTES = [
  '/profile',
  '/orders',
  '/settings',
  '/cart/checkout',
];

/**
 * Define rutas que requieren roles específicos
 */
export const ROLE_PROTECTED_ROUTES = {
  admin: [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/products',
    '/admin/orders',
  ],
  moderator: [
    '/admin/dashboard',
    '/admin/orders',
  ],
};

/**
 * Verifica si una ruta es completamente pública
 */
export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });
};

/**
 * Verifica si una ruta requiere autenticación básica
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

/**
 * Verifica si una ruta requiere un rol específico
 */
export const getRequiredRole = (pathname: string): string | null => {
  for (const [role, routes] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    if (routes.some(route => pathname.startsWith(route))) {
      return role;
    }
  }
  return null;
};

/**
 * Determina si el usuario puede acceder a una ruta
 */
export const canAccessRoute = (
  pathname: string, 
  isAuthenticated: boolean, 
  userRole?: string
): { canAccess: boolean; reason?: string; redirectTo?: string } => {
  // Rutas públicas - siempre accesibles
  if (isPublicRoute(pathname)) {
    return { canAccess: true };
  }

  // Rutas con roles específicos
  const requiredRole = getRequiredRole(pathname);
  if (requiredRole) {
    if (!isAuthenticated) {
      return { 
        canAccess: false, 
        reason: 'authentication_required',
        redirectTo: '/login'
      };
    }
    
    if (userRole !== requiredRole && userRole !== 'admin') {
      return { 
        canAccess: false, 
        reason: 'insufficient_permissions',
        redirectTo: userRole === 'admin' ? '/admin/dashboard' : '/'
      };
    }
    
    return { canAccess: true };
  }

  // Rutas protegidas básicas
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      return { 
        canAccess: false, 
        reason: 'authentication_required',
        redirectTo: '/login'
      };
    }
    
    return { canAccess: true };
  }

  // Por defecto, permitir acceso (ruta no clasificada)
  return { canAccess: true };
};
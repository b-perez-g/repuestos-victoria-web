'use client';

import { useAuth } from '@/contexts/auth/useAuth';
import NotFound from '@/components/NotFound';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles = []
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar 404
  if (!isAuthenticated) {
    return (
      <NotFound
        title="Página no encontrada"
        message="Lo sentimos, la página que buscas no existe o no está disponible en este momento."
        showBackButton={false}
        showHomeButton={true}
      />
    );
  }

  // Si hay roles específicos requeridos, verificar permisos
  if (allowedRoles.length > 0 && user) {
    const hasPermission = allowedRoles.includes(user.role || '');
    if (!hasPermission) {
      return (
        <NotFound
          title="Página no encontrada"
          message="Lo sentimos, la página que buscas no existe o no está disponible en este momento."
          showBackButton={false}
          showHomeButton={true}
        />
      );
    }
  }

  return <>{children}</>;
}
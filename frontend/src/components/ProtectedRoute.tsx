'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si no está autenticado, redirigir al login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Si hay roles específicos requeridos, verificar permisos
      if (allowedRoles.length > 0 && user) {
        const hasPermission = allowedRoles.includes(user.role || '');
        if (!hasPermission) {
          // Redirigir según el rol del usuario
          if (user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
          return;
        }
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, redirectTo, router]);

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

  // No mostrar contenido si no está autenticado
  if (!isAuthenticated) {
    return null;
  }

  // No mostrar contenido si no tiene permisos
  if (allowedRoles.length > 0 && user) {
    const hasPermission = allowedRoles.includes(user.role || '');
    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-error mb-4">Acceso Denegado</h1>
            <p className="text-muted mb-4">No tienes permisos para acceder a esta página.</p>
            <button 
              onClick={() => router.back()}
              className="btn bg-accent text-white hover:brightness-110"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
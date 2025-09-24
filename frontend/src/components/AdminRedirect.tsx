'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth/useAuth';

interface AdminRedirectProps {
  children: React.ReactNode;
}

export default function AdminRedirect({ children }: AdminRedirectProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Si no está cargando y es admin
    if (!loading && user && (user.role === 'admin' || user.role === 'superadmin')) {
      // Lista de rutas permitidas para admin
      const adminAllowedRoutes = [
        '/admin',
        '/admin/dashboard',
        '/admin/users',
        '/admin/products',
        '/admin/categories',
        '/admin/orders',
        '/admin/settings'
      ];

      // Verificar si la ruta actual está permitida para admin
      const isAdminRoute = adminAllowedRoutes.some(route => pathname.startsWith(route));

      // Si no es una ruta admin, redirigir al dashboard
      if (!isAdminRoute) {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  // Mostrar loading mientras se verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si es admin y no está en ruta permitida, no mostrar contenido
  if (user && (user.role === 'admin' || user.role === 'superadmin')) {
    const adminAllowedRoutes = [
      '/admin',
      '/admin/dashboard',
      '/admin/users',
      '/admin/products',
      '/admin/categories',
      '/admin/orders',
      '/admin/settings'
    ];

    const isAdminRoute = adminAllowedRoutes.some(route => pathname.startsWith(route));

    if (!isAdminRoute) {
      return null; // No mostrar nada mientras redirige
    }
  }

  return <>{children}</>;
}
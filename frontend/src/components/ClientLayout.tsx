//components/ClientLayout
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth/useAuth';
import Navbar from '@/components/Navbar';
import AdminNavbar from '@/components/AdminNavbar';
import Footer from '@/components/Footer';
import AdminRedirect from '@/components/AdminRedirect';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Solo después de montar en cliente
    setIsMounted(true);
  }, []);

  const shouldHideLayout = () => {
    const exactRoutes = [
      '/login',
      '/register',
      '/forgot-password',
      '/email-verification',
      '/404',
      '/500'
    ];

    const routePatterns = [
      '/reset-password/',
      '/verify-email/',
      '/auth/',
    ];

    if (exactRoutes.includes(pathname)) {
      return true;
    }

    return routePatterns.some(pattern => pathname.startsWith(pattern));
  };

  const isAdminRoute = () => {
    return pathname.startsWith('/admin/');
  };

  if (!isMounted) {
    // Evitar renderizado incorrecto en SSR
    return null;
  }

  if (shouldHideLayout()) {
    return (
      <AdminRedirect>
        <main className="flex-grow px-4 py-6">{children}</main>
      </AdminRedirect>
    );
  }

  // Layout para rutas admin
  if (isAdminRoute()) {
    return (
      <AdminRedirect>
        <AdminNavbar />
        <main className="flex-grow">{children}</main>
      </AdminRedirect>
    );
  }

  // Layout para rutas de cliente
  return (
    <AdminRedirect>
      <Navbar />
      <main className="flex-grow px-4 py-6">{children}</main>
      <Footer />
    </AdminRedirect>
  );
}

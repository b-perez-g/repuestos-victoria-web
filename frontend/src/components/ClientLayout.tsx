//components/ClientLayout
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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

  if (!isMounted) {
    // Evitar renderizado incorrecto en SSR
    return null;
  }

  if (shouldHideLayout()) {
    return <main className="flex-grow px-4 py-6">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow px-4 py-6">{children}</main>
      <Footer />
    </>
  );
}

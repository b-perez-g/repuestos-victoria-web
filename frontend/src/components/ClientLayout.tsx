// components/ClientLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
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
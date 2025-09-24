'use client';

import { ReactNode, useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface CategoryLayoutProps {
  children: ReactNode;
  params: { category: string };
}

const adminMenu = [
  { id: 1, name: 'Dashboard', href: '/admin/dashboard' },
  { id: 2, name: 'Productos', href: '/admin/products' },
  { id: 3, name: 'Categorías', href: '/admin/categories' },
  { id: 4, name: 'Pedidos', href: '/admin/orders' },
  { id: 5, name: 'Usuarios', href: '/admin/users' },
  { id: 6, name: 'Configuración', href: '/admin/settings' }
];

export default function AdminLayout({ children }: CategoryLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Mobile Menu Button */}
          <div className="lg:hidden fixed top-20 left-4 z-40">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-surface shadow-md text-muted hover:text-primary hover:bg-surface-secondary"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Sidebar Desktop */}
          <aside className="hidden lg:block w-64 bg-surface shadow-sm border-r border-border min-h-[calc(100vh-64px)]">
            <div className="p-6">
              <h2 className="text-sm font-semibold text-muted uppercase mb-4">Panel Admin</h2>
              <nav className="space-y-2">
                {adminMenu.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-accent/10 text-accent font-semibold border-l-4 border-accent'
                          : 'text-primary hover:bg-surface-secondary'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Sidebar Mobile */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="relative bg-surface w-64 max-w-sm flex flex-col shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-primary">Panel Admin</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-md text-muted hover:text-primary hover:bg-surface-secondary"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                  {adminMenu.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-accent/10 text-accent font-semibold'
                            : 'text-primary hover:bg-surface-secondary'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </aside>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-64px)] p-6 lg:ml-0 ml-16">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

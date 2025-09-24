'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/auth/useAuth";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import AvatarDropdown from "./AvatarDropdown";

export default function AdminNavbar() {
  const { user, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getAvatarItems = () => [
    { label: "Panel Admin", href: "/admin/dashboard" },
    { label: "Gestión de Usuarios", href: "/admin/users" },
    { label: "Configuración", href: "/admin/settings" },
    { label: "Cerrar Sesión", href: "#", onClick: logout },
  ];

  const renderUserSection = () => {
    if (!mounted || loading) {
      return (
        <div className="w-8 h-8 bg-surface-secondary rounded-full animate-pulse"></div>
      );
    }

    if (user) {
      return (
        <AvatarDropdown
          user={{
            name: user.name,
            email: user.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
          }}
          items={getAvatarItems()}
        />
      );
    }

    return null;
  };

  return (
    <nav className="bg-surface border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center space-x-3">
              <img
                src="/logo-repuestos-victoria.svg"
                alt="Panel Admin"
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-primary">Panel Admin</span>
                <div className="text-xs text-muted">Repuestos Victoria</div>
              </div>
            </Link>
          </div>

          {/* Right side - Solo theme y avatar */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {renderUserSection()}
          </div>
        </div>
      </div>
    </nav>
  );
}
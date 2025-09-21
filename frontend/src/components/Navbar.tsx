"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth/useAuth";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import AvatarDropdown from "./AvatarDropdown";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import SearchInput from "./SearchInput";
import LoginButton from "./LoginButton";
import Cookies from 'js-cookie';

export default function Navbar() {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const [mounted, setMounted] = useState(false);

    // Asegurar que el componente esté montado antes de mostrar contenido dinámico
    useEffect(() => {
        setMounted(true);
    }, []);

    // Debug del estado
    useEffect(() => {
        if (mounted) {
            console.log('Navbar - Estado:', { 
                isAuthenticated, 
                hasUser: !!user, 
                loading,
                hasCookie: !!Cookies.get('token')
            });
        }
    }, [isAuthenticated, user, loading, mounted]);

    const getAvatarItems = () => [
        { label: "Mi Perfil", href: "/profile" },
        { label: "Mis Pedidos", href: "/orders" },
        ...(user?.role === 'admin' ? [
            { label: "Dashboard Admin", href: "/admin/dashboard" },
            { label: "Gestión de Usuarios", href: "/admin/users" }
        ] : []),
        { label: "Configuración", href: "/settings" },
        { label: "Cerrar Sesión", href: "#", onClick: logout }
    ];

    // Función para renderizar la sección de usuario
    const renderUserSection = () => {
        // Mientras carga, mostrar skeleton
        if (!mounted || loading) {
            return (
                <div className="w-8 h-8 bg-surface-secondary rounded-full animate-pulse"></div>
            );
        }

        // Si está autenticado Y tiene usuario, mostrar avatar
        if (isAuthenticated && user) {
            return (
                <AvatarDropdown 
                    items={getAvatarItems()} 
                    user={user} 
                    onLogout={logout} 
                />
            );
        }

        // Si no está autenticado O no tiene usuario, mostrar botón login
        return <LoginButton />;
    };

    return (
        <nav className="bg-nav text-nav-txt shadow-sm px-4 sm:px-8 py-4">
            <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-center sm:gap-4">
                {/* Mobile: Logo + Icons */}
                <div className="flex justify-between items-center sm:col-span-3 sm:hidden mb-4">
                    <Link href="/">
                        <img
                            src="/logo-repuestos-victoria.svg"
                            alt="Logo Repuestos Victoria"
                            className="h-14 cursor-pointer"
                        />
                    </Link>

                    <div className="flex items-center space-x-4">
                        <button className="btn btn-ghost btn-circle relative">
                            <ShoppingCartIcon className="h-7 w-7 text-current" />
                            <span className="badge badge-xs badge-primary absolute top-0 right-0 indicator-item"></span>
                        </button>
                        <ThemeToggle />
                        {renderUserSection()}
                    </div>
                </div>

                {/* Desktop: Logo */}
                <div className="hidden sm:flex items-center">
                    <Link href="/">
                        <img
                            src="/logo-repuestos-victoria.svg"
                            alt="Logo Repuestos Victoria"
                            className="h-20 cursor-pointer"
                        />
                    </Link>
                </div>

                {/* Search */}
                <div className="w-full flex justify-center order-last sm:order-none">
                    <div className="w-full max-w-xl px-2 sm:px-0">
                        <SearchInput />
                    </div>
                </div>

                {/* Desktop: Icons */}
                <div className="hidden sm:flex items-center justify-end space-x-4">
                    <button className="btn btn-ghost btn-circle relative">
                        <ShoppingCartIcon className="h-7 w-7 text-current" />
                        <span className="badge badge-xs badge-primary absolute top-0 right-0 indicator-item"></span>
                    </button>
                    <ThemeToggle />
                    {renderUserSection()}
                </div>
            </div>
        </nav>
    );
}
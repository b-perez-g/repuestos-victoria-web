"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth/useAuth";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import AvatarDropdown from "./AvatarDropdown";
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import SearchInput from "./SearchInput";
import LoginButton from "./LoginButton";
import Cookies from "js-cookie";

export default function Navbar() {
    const { user, isAuthenticated, logout, loading } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Mostrar opciones diferentes según el rol
    const options = user && (user.role === 'admin' || user.role === 'superadmin')
        ? [
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Usuarios", href: "/admin/users" },
            { label: "Productos", href: "/admin/products" },
            { label: "Categorías", href: "/admin/categories" },
          ]
        : [
            { label: "Inicio", href: "/" },
            { label: "Categorías", href: "/categories" },
            { label: "Sobre nosotros", href: "/about" },
          ];

    // Asegurar que el componente esté montado antes de mostrar contenido dinámico
    useEffect(() => {
        setMounted(true);
    }, []);


    const getAvatarItems = () => {
        if (user?.role === "admin" || user?.role === "superadmin") {
            return [
                { label: "Panel Admin", href: "/admin/dashboard" },
                { label: "Gestión de Usuarios", href: "/admin/users" },
                { label: "Configuración", href: "/admin/settings" },
                { label: "Cerrar Sesión", href: "#", onClick: logout },
            ];
        }

        return [
            { label: "Mi Perfil", href: "/profile" },
            { label: "Mis Pedidos", href: "/orders" },
            { label: "Configuración", href: "/settings" },
            { label: "Cerrar Sesión", href: "#", onClick: logout },
        ];
    };

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
        <nav className="bg-nav text-nav-txt shadow-sm">
            <div className="px-4 sm:px-8 py-4">
                <div className="flex flex-col md:grid md:grid-cols-3 md:items-center md:gap-4">
                    {/* Mobile: Logo + Icons */}
                    <div className="flex justify-between items-center md:hidden mb-4">
                        <Link href="/">
                            <img
                                src="/logo-repuestos-victoria.svg"
                                alt="Logo Repuestos Victoria"
                                className="h-14 cursor-pointer"
                            />
                        </Link>

                        <div className="flex items-center space-x-3">
                            {/* Carrito móvil - Solo para clientes */}
                            {!(user?.role === 'admin' || user?.role === 'superadmin') && (
                                <button className="btn btn-ghost btn-circle relative">
                                    <ShoppingCartIcon className="h-6 w-6 text-current" />
                                    <span className="badge badge-xs badge-primary absolute top-0 right-0 indicator-item"></span>
                                </button>
                            )}
                            <ThemeToggle />
                            {renderUserSection()}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="btn btn-ghost btn-circle"
                            >
                                {mobileMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6 text-current" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6 text-current" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Desktop: Logo */}
                    <div className="hidden md:flex items-center">
                        <Link href="/">
                            <img
                                src="/logo-repuestos-victoria.svg"
                                alt="Logo Repuestos Victoria"
                                className="h-20 cursor-pointer"
                            />
                        </Link>
                    </div>

                    {/* Search - Solo para clientes */}
                    {!(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <div className="w-full flex justify-center order-last md:order-none">
                            <div className="w-full max-w-xl px-2 md:px-0">
                                <SearchInput />
                            </div>
                        </div>
                    )}

                    {/* Desktop: Icons */}
                    <div className="hidden md:flex items-center justify-end space-x-4">
                        {/* Carrito - Solo para clientes */}
                        {!(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <button className="btn btn-ghost btn-circle relative">
                                <ShoppingCartIcon className="h-7 w-7 text-current" />
                                <span className="badge badge-xs badge-primary absolute top-0 right-0 indicator-item"></span>
                            </button>
                        )}
                        <ThemeToggle />
                        {renderUserSection()}
                    </div>
                </div>
            </div>

            {/* Menu mobile desplegable */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-muted/20">
                    <div className="px-4 py-3 space-y-2 bg-surface-secondary/50">
                        {options.map((option) => (
                            <Link
                                key={option.href}
                                href={option.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium py-2 px-3 rounded-md hover:bg-gray-50"
                            >
                                {option.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Menu inferior elegante - Solo desktop */}
            <div className="hidden md:block border-t border-muted bg-surface-secondary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-3 space-x-12">
                        {options.map((option, index) => (
                            <Link
                                key={option.href}
                                href={option.href}
                                className="group relative text-muted hover:text-primary transition-all duration-300 font-medium text-sm tracking-wide uppercase"
                            >
                                {option.label}

                                {/* Línea inferior animada */}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>

                                {/* Punto decorativo */}
                                {index < options.length - 1 && (
                                    <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-muted/30 rounded-full"></span>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}

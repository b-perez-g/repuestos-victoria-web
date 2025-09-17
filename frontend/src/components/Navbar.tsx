"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import AvatarDropdown from "./AvatarDropdown";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import SearchInput from "./SearchInput";
import LoginButton from "./LoginButton";

export default function Navbar() {
  return (
    <nav className="bg-nav text-nav-txt shadow-sm px-4 sm:px-8 py-4">
      {/* En mobile: 2 filas, en desktop: grid-cols-3 */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-center sm:gap-4">
        {/* Primera fila: Logo + Iconos (en una línea incluso en móvil) */}
        <div className="flex justify-between items-center sm:col-span-3 sm:hidden mb-4">
          {/* Logo */}
          <img
            src="logo-repuestos-victoria.svg"
            alt="Logo"
            className="h-14"
          />

          {/* Iconos */}
          <div className="flex items-center space-x-4">
            <button className="btn btn-ghost btn-circle relative">
              <ShoppingCartIcon className="h-7 w-7 text-current" />
              <span className="badge badge-xs badge-primary absolute top-0 right-0 indicator-item"></span>
            </button>
            <ThemeToggle />
            <LoginButton />
          </div>
        </div>

        {/* Logo (solo visible en sm+) */}
        <div className="hidden sm:flex items-center">
          <img
            src="logo-repuestos-victoria.svg"
            alt="Logo"
            className="h-20"
          />
        </div>

        {/* Search input */}
        <div className="w-full flex justify-center order-last sm:order-none">
          <div className="w-full max-w-xl px-2 sm:px-0">
            <SearchInput />
          </div>
        </div>

        {/* Iconos (solo visibles en sm+) */}
        <div className="hidden sm:flex items-center justify-end space-x-4">
          <button className="btn btn-ghost btn-circle relative">
            <ShoppingCartIcon className="h-7 w-7 text-current" />
            <span className="badge badge-xs badge-primary absolute top-0 right-0 indicator-item"></span>
          </button>
          <ThemeToggle />
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}

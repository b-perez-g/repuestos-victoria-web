//components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Obtenemos tema guardado en localStorage o forzamos 'light' por defecto
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "light";

    setTheme(initialTheme);

    // Limpiamos clases por si había alguna y aplicamos la correspondiente
    document.documentElement.classList.remove("dark");
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    console.log(newTheme);
    setTheme(newTheme);

    // Aplicamos o quitamos clase 'dark' en <html>
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // Guardamos preferencia
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle"
      title = {theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
    >
      {theme === "light" ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  );
}

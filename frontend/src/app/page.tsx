"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);

  const login = async (): Promise<void> => {
    const correo = "bastian.perezgallardo@gmail.com";
    const contrasena = "#Bastian1";
    const nombres = "Bastian Daniel";
    const a_paterno = "Pérez";
    const a_materno = null;
    const id_rol = 3;

    try {
      const response = await api.post("/auth/register", {
        correo,
        contrasena,
        nombres,
        a_paterno,
        a_materno,
        id_rol,
      });

      if (response.data.success) {
        const { accessToken, refreshToken, user: userData } = response.data;
        setMessage("Usuario creado con éxito.");
        // Aquí podrías guardar tokens, redirigir, etc.
      } else {
        // Mensaje de error enviado por backend (ej: email ya registrado)
        setMessage(response.data.message || "Error desconocido");
      }
    } catch (error: any) {
      if (error.response) {
        // Error desde backend (status 4xx o 5xx)
        setMessage(error.response.data.message || "Error en el servidor");
      } else {
        // Error de red u otro
        setMessage(error.message || "Error desconocido");
      }
    }
  };

  const handleClick = async () => {
    setMessage(null); // Limpiar mensaje previo
    await login();
  };

  return (
    <div>
      <button className="btn" onClick={handleClick}>
        Crear usuario
      </button>

      {message && <p className="mt-4 text-red-600">{message}</p>}
    </div>
  );
}

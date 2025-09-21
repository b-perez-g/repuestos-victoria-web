//app/verify-email/[token]/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import {
    CheckCircleIcon,
    XCircleIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/api";

type VerificationStatus =
    | "loading"
    | "success"
    | "error"
    | "expired"
    | "invalid";

// Variable global para persistir entre re-renders del Strict Mode
let hasVerifiedGlobally = false;

export default function EmailVerifiedPage() {
    const [status, setStatus] = useState<VerificationStatus>("loading");
    const [message, setMessage] = useState("");
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    useEffect(() => {
        const verifyEmail = async () => {
            // Verificar si ya se ejecutó globalmente
            if (hasVerifiedGlobally) {
                // Si ya se verificó, mostrar mensaje apropiado
                setStatus("invalid");
                setMessage("El enlace de verificación ya ha sido utilizado");
                return;
            }
            
            // Marcar como ejecutado antes de la petición
            hasVerifiedGlobally = true;
            
            try {
                const response = await api.get(`/auth/verify-email/${token}`);
                console.log(response);

                if (response.data.success) {
                    setStatus("success");
                    setMessage(
                        response.data.message ||
                            "Tu correo electrónico ha sido verificado exitosamente"
                    );
                } else {
                    setStatus("error");
                    setMessage(
                        response.data.message || "Error en la verificación"
                    );
                }
            } catch (error: any) {
                console.error("Error verificando email:", error);

                if (error.response?.status === 400) {
                    setStatus("invalid");
                    setMessage(
                        error.response.data?.message ||
                            "El enlace de verificación es inválido o ya ha sido utilizado"
                    );
                } else if (error.response?.status === 500) {
                    setStatus("error");
                    setMessage(
                        "Error del servidor al verificar el correo electrónico"
                    );
                } else {
                    setStatus("error");
                    setMessage(
                        "Error de conexión al verificar el correo electrónico"
                    );
                }
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setStatus("invalid");
            setMessage("Token de verificación no válido");
        }

        // Cleanup: resetear la variable global cuando el componente se desmonte realmente
        return () => {
            // Solo resetear si estamos en un desmontaje real, no del Strict Mode
            setTimeout(() => {
                hasVerifiedGlobally = false;
            }, 1000);
        };
    }, [token]);

    const getStatusIcon = () => {
        switch (status) {
            case "loading":
                return (
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
                );
            case "success":
                return <CheckCircleIcon className="h-16 w-16 text-success" />;
            case "error":
            case "expired":
            case "invalid":
                return <XCircleIcon className="h-16 w-16 text-error" />;
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "success":
                return "text-success";
            case "error":
            case "expired":
            case "invalid":
                return "text-error";
            default:
                return "text-primary";
        }
    };

    const getBackgroundColor = () => {
        switch (status) {
            case "success":
                return "bg-success/10 border-success/20";
            case "error":
            case "expired":
            case "invalid":
                return "bg-error/10 border-error/20";
            default:
                return "bg-accent/10 border-accent/20";
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-4 relative">
            {/* ThemeToggle fijo arriba derecha */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-lg space-y-6">
                {/* Header */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <img
                        src="/logo-repuestos-victoria.svg"
                        alt="Logo Repuestos Victoria"
                        className="h-16 w-auto"
                    />

                    {/* Icono de estado */}
                    <div className="flex items-center justify-center">
                        {getStatusIcon()}
                    </div>

                    {/* Título dinámico */}
                    <h1
                        className={`text-3xl font-bold text-center ${getStatusColor()}`}
                    >
                        {status === "loading" && "Verificando..."}
                        {status === "success" && "Verificación exitosa"}
                        {status === "error" && "Error de verificación"}
                        {status === "expired" && "Enlace expirado"}
                        {status === "invalid" && "Enlace inválido"}
                    </h1>
                </div>

                {/* Mensaje de estado */}
                {status !== "loading" && (
                    <div
                        className={`border rounded-lg p-4 text-center ${getBackgroundColor()}`}
                    >
                        <p className={`text-sm ${getStatusColor()}`}>
                            {message}
                        </p>
                    </div>
                )}

                {/* Acciones según el estado */}
                <div className="space-y-3">
                    {status === "success" && (
                        <>
                            <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
                                <p className="text-sm text-success">
                                    ¡Excelente! Ya puedes iniciar sesión en tu
                                    cuenta.
                                </p>
                            </div>

                            <Link
                                href="/login"
                                className="btn w-full bg-accent text-white hover:brightness-110 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                Iniciar sesión
                                <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                        </>
                    )}

                    {(status === "expired" || status === "invalid") && (
                        <>
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted">
                                    ¿Necesitas un nuevo enlace de verificación?
                                </p>
                            </div>

                            <Link
                                href="/verify-email"
                                className="btn w-full bg-accent text-white hover:brightness-110 transition-all duration-200"
                            >
                                Solicitar nuevo enlace
                            </Link>

                            <Link
                                href="/register"
                                className="btn btn-outline w-full border-accent text-accent hover:bg-accent hover:text-white transition"
                            >
                                Crear nueva cuenta
                            </Link>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <button
                                onClick={() => {
                                    hasVerifiedGlobally = false; // Resetear para permitir reintento
                                    window.location.reload();
                                }}
                                className="btn w-full bg-accent text-white hover:brightness-110 transition-all duration-200"
                            >
                                Intentar nuevamente
                            </button>

                            <Link
                                href="/verify-email"
                                className="btn btn-outline w-full border-accent text-accent hover:bg-accent hover:text-white transition"
                            >
                                Solicitar nuevo enlace
                            </Link>
                        </>
                    )}

                    {status === "loading" && (
                        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-center">
                            <p className="text-sm text-muted">
                                Verificando tu correo electrónico, espera un
                                momento...
                            </p>
                        </div>
                    )}
                </div>

                {/* Enlaces adicionales */}
                <div className="text-center">
                    <p className="text-xs text-muted">
                        ¿Necesitas ayuda?{" "}
                        <Link
                            href="/contact"
                            className="text-accent hover:underline"
                        >
                            Contáctanos
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
//app/verify-account/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import {
    EnvelopeIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function EmailVerificationPage() {
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';

    const handleResendEmail = async () => {
        try {
            setIsResending(true);
            
            const response = await api.post('/auth/resend-verification', {
                email: email
            });

            if (response.data.success) {
                setResendSuccess(true);
                toast.success('Correo de verificación reenviado exitosamente');
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 
                'Error al reenviar el correo de verificación'
            );
        } finally {
            setIsResending(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-4 relative">
            {/* ThemeToggle fijo arriba derecha */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-lg space-y-6 relative">
                {/* Botón volver atrás */}
                <Link href="/login">
                    <button
                        aria-label="Ir al login"
                        className="absolute top-4 left-4 p-2 rounded-md hover:bg-surface-secondary transition"
                        type="button"
                    >
                        <ArrowLeftIcon className="h-6 w-6 text-muted" />
                    </button>
                </Link>

                {/* Header */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <img 
                        src="/logo-repuestos-victoria.svg" 
                        alt="Logo Repuestos Victoria" 
                        className="h-16 w-auto" 
                    />
                    
                    {/* Icono de email */}
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                        <EnvelopeIcon className="h-8 w-8 text-accent" />
                    </div>

                    <h1 className="text-3xl font-bold text-primary text-center">
                        Verifica tu correo
                    </h1>
                    
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted">
                            Te hemos enviado un correo de verificación a:
                        </p>
                        <p className="text-sm font-medium text-primary">
                            {email}
                        </p>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-3">
                    <h3 className="font-medium text-primary flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-accent" />
                        Pasos a seguir:
                    </h3>
                    <ul className="text-sm text-muted space-y-2 list-disc list-inside ml-7">
                        <li>Revisa tu bandeja de entrada</li>
                        <li>Busca un correo de "Repuestos Victoria"</li>
                        <li>Haz clic en el enlace de verificación</li>
                        <li>Si no lo encuentras, revisa tu carpeta de spam</li>
                    </ul>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                    {/* Botón reenviar */}
                    <button
                        onClick={handleResendEmail}
                        disabled={isResending || resendSuccess}
                        className="btn w-full bg-accent text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isResending ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Reenviando...</span>
                            </div>
                        ) : resendSuccess ? (
                            <div className="flex items-center justify-center space-x-2">
                                <CheckCircleIcon className="h-4 w-4" />
                                <span>Correo reenviado</span>
                            </div>
                        ) : (
                            "Reenviar correo de verificación"
                        )}
                    </button>

                    {/* Mensaje de éxito */}
                    {resendSuccess && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm text-success text-center">
                            El correo ha sido reenviado. Revisa tu bandeja de entrada.
                        </div>
                    )}
                </div>

                {/* Enlaces adicionales */}
                <div className="text-center space-y-2">
                    <p className="text-xs text-muted">
                        ¿Ya verificaste tu correo?
                    </p>
                    <Link
                        href="/login"
                        className="btn btn-outline w-full border-accent text-accent hover:bg-accent hover:text-white transition"
                    >
                        Ir a iniciar sesión
                    </Link>
                </div>

                {/* Ayuda */}
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
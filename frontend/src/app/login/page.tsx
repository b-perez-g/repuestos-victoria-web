"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/utils/validators";
import { useAuth } from "@/contexts/auth/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import {
    EyeIcon,
    EyeSlashIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";

type FormData = {
    email: string;
    password: string;
};

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormData>({
        resolver: yupResolver(loginSchema),
    });

    // Redireccionar si ya está autenticado
    useEffect(() => {
        if (isAuthenticated && !loading) {
            router.push('/dashboard'); // o la ruta que corresponda
        }
    }, [isAuthenticated, loading, router]);

    const onSubmit = async (data: FormData) => {
        try {
            await login(data.email, data.password);
            // El redireccionamiento se maneja en el useEffect
        } catch (error: any) {
            // Manejar errores específicos de validación
            if (error.response?.status === 401) {
                setError('email', {
                    type: 'manual',
                    message: 'Credenciales inválidas'
                });
                setError('password', {
                    type: 'manual',
                    message: 'Credenciales inválidas'
                });
            } else if (error.response?.status === 422) {
                // Errores de validación del servidor
                const validationErrors = error.response.data?.errors;
                if (validationErrors) {
                    Object.keys(validationErrors).forEach((field) => {
                        setError(field as keyof FormData, {
                            type: 'manual',
                            message: validationErrors[field][0]
                        });
                    });
                }
            }
        }
    };

    // Mostrar loading mientras se verifica la autenticación
    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                    <p className="mt-4 text-muted">Cargando...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-4 relative">
            {/* ThemeToggle fijo arriba derecha */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-lg space-y-6 relative">
                {/* Botón volver atrás */}
                <button
                    onClick={() => router.back()}
                    aria-label="Volver atrás"
                    className="absolute top-4 left-4 p-2 rounded-md hover:bg-surface-secondary transition"
                    type="button"
                >
                    <ArrowLeftIcon className="h-6 w-6 text-muted" />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <img 
                        src="/logo-repuestos-victoria.svg" 
                        alt="Logo Repuestos Victoria" 
                        className="h-16 w-auto" 
                    />
                    <h1 className="text-3xl font-bold text-primary text-center">
                        Iniciar sesión
                    </h1>
                    <p className="text-sm text-center text-muted">
                        Accede a tu cuenta para continuar
                    </p>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                >
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block mb-1 text-sm font-medium"
                        >
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="tucorreo@ejemplo.com"
                            className={`w-full input input-bordered bg-surface-secondary border ${
                                errors.email ? "border-error" : "border-border"
                            } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                            aria-invalid={errors.email ? "true" : "false"}
                            aria-describedby="email-error"
                            disabled={isSubmitting}
                        />
                        {errors.email && (
                            <p
                                className="mt-1 text-sm text-error"
                                id="email-error"
                            >
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-1 text-sm font-medium"
                        >
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                placeholder="••••••••"
                                className={`w-full input input-bordered pr-10 bg-surface-secondary border ${
                                    errors.password
                                        ? "border-error"
                                        : "border-border"
                                } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                                aria-invalid={
                                    errors.password ? "true" : "false"
                                }
                                aria-describedby="password-error"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface rounded"
                                disabled={isSubmitting}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-muted" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-muted" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p
                                className="mt-1 text-sm text-error"
                                id="password-error"
                            >
                                {errors.password.message}
                            </p>
                        )}
                        <div className="mt-1 text-right">
                            <Link
                                href="/forgot-password"
                                className="text-sm underline text-info hover:text-info-dark transition"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    {/* Botón enviar */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn w-full bg-accent text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Iniciando sesión...</span>
                            </div>
                        ) : (
                            "Iniciar sesión"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="text-center text-sm text-muted">
                    ¿No tienes cuenta?
                </div>

                {/* Registrar */}
                <Link
                    href="/register"
                    className="btn btn-outline w-full border-accent text-accent hover:bg-accent hover:text-white transition"
                >
                    Crear una cuenta
                </Link>
            </div>
        </main>
    );
}
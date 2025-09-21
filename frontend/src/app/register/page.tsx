"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/utils/validators";
import { useAuth } from "@/contexts/auth/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import {
    EyeIcon,
    EyeSlashIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";

type FormData = {
    nombres: string;
    a_paterno: string;
    a_materno?: string;
    correo: string;
    contrasena: string;
    confirmarContrasena: string;
};

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const { register: registerUser, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<FormData>({
        resolver: yupResolver(registerSchema) as any
    });

    // Redireccionar si ya está autenticado
    useEffect(() => {
        if (isAuthenticated && !loading) {
            router.push("/");
        }
    }, [isAuthenticated, loading, router]);

    const onSubmit = async (data: FormData) => {
        try {
            // Limpiar errores previos
            setGeneralError("");

            const registerData = {
                correo: data.correo,
                contrasena: data.contrasena,
                nombres: data.nombres,
                a_paterno: data.a_paterno,
                a_materno: data.a_materno || null,
                id_rol: 3,
            };

            await registerUser(registerData);
            router.push(`/verify-account?email=${encodeURIComponent(data.correo)}`);
        } catch (error: any) {
            console.error("Error completo:", error);

            // Manejar errores específicos de validación de campos
            if (error.response?.status === 422) {
                const validationErrors = error.response.data?.errors;
                if (validationErrors) {
                    Object.keys(validationErrors).forEach((field) => {
                        // Solo setear errores en campos que existen en el formulario
                        if (
                            [
                                "correo",
                                "contrasena",
                                "nombres",
                                "a_paterno",
                                "a_materno",
                            ].includes(field)
                        ) {
                            setError(field as keyof FormData, {
                                type: "manual",
                                message: validationErrors[field][0],
                            });
                        }
                    });
                }
            }
            // Email ya registrado
            else if (
                error.response?.status === 409 ||
                error.response?.status === 400
            ) {
                const message = error.response?.data?.message;
                if (message && message.toLowerCase().includes("email")) {
                    setError("correo", {
                        type: "manual",
                        message: "Este correo electrónico ya está registrado",
                    });
                } else {
                    setGeneralError(message || "Error en el registro");
                }
            }
            // Errores generales del servidor
            else {
                setGeneralError(
                    error.response?.data?.message ||
                        error.message ||
                        "Error inesperado. Por favor intenta nuevamente."
                );
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
        <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative">
            {/* ThemeToggle fijo arriba derecha */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-lg space-y-6 relative">
                {/* Botón volver atrás */}
                <Link href="/">
                    <button
                        aria-label="Volver atrás"
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
                    <h1 className="text-3xl font-bold text-primary text-center">
                        Crear cuenta
                    </h1>
                    <p className="text-sm text-center text-muted">
                        Regístrate para acceder a tu cuenta
                    </p>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                >
                    {/* Error general del servidor */}
                    {generalError && (
                        <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-sm text-error">
                            {generalError}
                        </div>
                    )}
                    
                    {/* Nombres */}
                    <div>
                        <label
                            htmlFor="nombres"
                            className="block mb-1 text-sm font-medium"
                        >
                            Nombres
                        </label>
                        <input
                            id="nombres"
                            type="text"
                            {...register("nombres")}
                            placeholder="Tu nombre completo"
                            className={`w-full input input-bordered bg-surface-secondary border ${
                                errors.nombres
                                    ? "border-error"
                                    : "border-border"
                            } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                            aria-invalid={errors.nombres ? "true" : "false"}
                            aria-describedby="nombres-error"
                            disabled={isSubmitting}
                        />
                        {errors.nombres && (
                            <p
                                className="mt-1 text-sm text-error"
                                id="nombres-error"
                            >
                                {errors.nombres.message}
                            </p>
                        )}
                    </div>

                    {/* Apellido Paterno */}
                    <div>
                        <label
                            htmlFor="a_paterno"
                            className="block mb-1 text-sm font-medium"
                        >
                            Apellido Paterno
                        </label>
                        <input
                            id="a_paterno"
                            type="text"
                            {...register("a_paterno")}
                            placeholder="Tu apellido paterno"
                            className={`w-full input input-bordered bg-surface-secondary border ${
                                errors.a_paterno
                                    ? "border-error"
                                    : "border-border"
                            } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                            aria-invalid={errors.a_paterno ? "true" : "false"}
                            aria-describedby="a_paterno-error"
                            disabled={isSubmitting}
                        />
                        {errors.a_paterno && (
                            <p
                                className="mt-1 text-sm text-error"
                                id="a_paterno-error"
                            >
                                {errors.a_paterno.message}
                            </p>
                        )}
                    </div>

                    {/* Apellido Materno */}
                    <div>
                        <label
                            htmlFor="a_materno"
                            className="block mb-1 text-sm font-medium"
                        >
                            Apellido Materno{" "}
                            <span className="text-muted text-xs">
                                (opcional)
                            </span>
                        </label>
                        <input
                            id="a_materno"
                            type="text"
                            {...register("a_materno")}
                            placeholder="Tu apellido materno"
                            className={`w-full input input-bordered bg-surface-secondary border ${
                                errors.a_materno
                                    ? "border-error"
                                    : "border-border"
                            } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                            aria-invalid={errors.a_materno ? "true" : "false"}
                            aria-describedby="a_materno-error"
                            disabled={isSubmitting}
                        />
                        {errors.a_materno && (
                            <p
                                className="mt-1 text-sm text-error"
                                id="a_materno-error"
                            >
                                {errors.a_materno.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="correo"
                            className="block mb-1 text-sm font-medium"
                        >
                            Correo electrónico
                        </label>
                        <input
                            id="correo"
                            type="email"
                            {...register("correo")}
                            placeholder="tucorreo@ejemplo.com"
                            className={`w-full input input-bordered bg-surface-secondary border ${
                                errors.correo ? "border-error" : "border-border"
                            } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                            aria-invalid={errors.correo ? "true" : "false"}
                            aria-describedby="correo-error"
                            disabled={isSubmitting}
                        />
                        {errors.correo && (
                            <p
                                className="mt-1 text-sm text-error"
                                id="correo-error"
                            >
                                {errors.correo.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="contrasena"
                            className="block mb-1 text-sm font-medium"
                        >
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="contrasena"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                {...register("contrasena")}
                                placeholder="••••••••"
                                className={`w-full input input-bordered pr-10 bg-surface-secondary border ${
                                    errors.contrasena
                                        ? "border-error"
                                        : "border-border"
                                } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                                aria-invalid={
                                    errors.contrasena ? "true" : "false"
                                }
                                aria-describedby="contrasena-error"
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
                        {errors.contrasena && (
                            <p
                                className="mt-1 text-sm text-error"
                                id="contrasena-error"
                            >
                                {errors.contrasena.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label
                            htmlFor="confirmarContrasena"
                            className="block mb-1 text-sm font-medium"
                        >
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="confirmarContrasena"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                {...register("confirmarContrasena")}
                                placeholder="••••••••"
                                className={`w-full input input-bordered pr-10 bg-surface-secondary border ${
                                    errors.confirmarContrasena
                                        ? "border-error"
                                        : "border-border"
                                } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                                aria-invalid={
                                    errors.confirmarContrasena
                                        ? "true"
                                        : "false"
                                }
                                aria-describedby="confirmarContrasena-error"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface rounded"
                                disabled={isSubmitting}
                            >
                                {showConfirmPassword ? (
                                    <EyeSlashIcon className="h-5 w-5 text-muted" />
                                ) : (
                                    <EyeIcon className="h-5 w-5 text-muted" />
                                )}
                            </button>
                        </div>
                        {errors.confirmarContrasena && (
                            <p
                                className="mt-1 text-sm text-error"
                                id="confirmarContrasena-error"
                            >
                                {errors.confirmarContrasena.message}
                            </p>
                        )}
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
                                <span>Creando cuenta...</span>
                            </div>
                        ) : (
                            "Crear cuenta"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="text-center text-sm text-muted">
                    ¿Ya tienes cuenta?
                </div>

                {/* Login */}
                <Link
                    href="/login"
                    className="btn btn-outline w-full border-accent text-accent hover:bg-accent hover:text-white transition"
                >
                    Iniciar sesión
                </Link>
            </div>
        </main>
    );
}
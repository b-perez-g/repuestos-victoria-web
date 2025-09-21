'use client';

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeftIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import api from "@/lib/api";
import toast from "react-hot-toast";

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required("El correo electrónico es obligatorio")
    .email("Debe ser un correo electrónico válido")
});

type FormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post('/auth/forgot-password', {
        email: data.email.toLowerCase().trim()
      });
      
      if (response.data.success) {
        setSubmittedEmail(data.email);
        setIsSubmitted(true);
        toast.success('Email de recuperación enviado');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 
        'Error enviando email de recuperación'
      );
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4 relative">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-lg space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <img
              src="/logo-repuestos-victoria.svg"
              alt="Logo Repuestos Victoria"
              className="h-16 w-auto"
            />
            
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <EnvelopeIcon className="h-8 w-8 text-success" />
            </div>

            <h1 className="text-3xl font-bold text-primary text-center">
              Email Enviado
            </h1>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted">
                Te hemos enviado un enlace de recuperación a:
              </p>
              <p className="text-sm font-medium text-primary">
                {submittedEmail}
              </p>
            </div>
          </div>

          <div className="bg-success/5 border border-success/20 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-primary">Revisa tu correo</h3>
            <ul className="text-sm text-muted space-y-1 list-disc list-inside">
              <li>Busca un correo de "Repuestos Victoria"</li>
              <li>Haz clic en el enlace de recuperación</li>
              <li>Si no lo encuentras, revisa tu carpeta de spam</li>
              <li>El enlace expira en 1 hora</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setSubmittedEmail("");
              }}
              className="btn btn-outline w-full border-accent text-accent hover:bg-accent hover:text-white transition"
            >
              Enviar a otro correo
            </button>

            <Link
              href="/login"
              className="btn w-full bg-accent text-white hover:brightness-110 transition-all duration-200"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-lg space-y-6 relative">
        <Link href="/login">
          <button
            aria-label="Volver al login"
            className="absolute top-4 left-4 p-2 rounded-md hover:bg-surface-secondary transition"
            type="button"
          >
            <ArrowLeftIcon className="h-6 w-6 text-muted" />
          </button>
        </Link>

        <div className="flex flex-col items-center justify-center space-y-4">
          <img
            src="/logo-repuestos-victoria.svg"
            alt="Logo Repuestos Victoria"
            className="h-16 w-auto"
          />
          
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <EnvelopeIcon className="h-8 w-8 text-accent" />
          </div>

          <h1 className="text-3xl font-bold text-primary text-center">
            Recuperar Contraseña
          </h1>
          
          <p className="text-sm text-center text-muted">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium">
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
              <p className="mt-1 text-sm text-error" id="email-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn w-full bg-accent text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enviando...</span>
              </div>
            ) : (
              "Enviar enlace de recuperación"
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted">
            ¿Recordaste tu contraseña?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
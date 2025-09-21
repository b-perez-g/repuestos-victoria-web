'use client';

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useRouter } from "next/navigation";
import * as yup from "yup";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  EyeIcon, 
  EyeSlashIcon, 
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon 
} from "@heroicons/react/24/outline";
import api from "@/lib/api";
import toast from "react-hot-toast";

const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      "La contraseña debe tener al menos 8 caracteres, incluyendo: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial"
    ),
  confirmPassword: yup
    .string()
    .required("Confirma tu contraseña")
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
});

type FormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: data.password
      });
      
      if (response.data.success) {
        setIsCompleted(true);
        toast.success('Contraseña actualizada exitosamente');
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('El enlace de recuperación es inválido o ha expirado');
      } else {
        toast.error(
          error.response?.data?.message || 
          'Error restableciendo la contraseña'
        );
      }
    }
  };

  if (isCompleted) {
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
              <CheckCircleIcon className="h-8 w-8 text-success" />
            </div>

            <h1 className="text-3xl font-bold text-success text-center">
              Contraseña Actualizada
            </h1>
            
            <p className="text-sm text-center text-muted">
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>

          <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
            <p className="text-sm text-success">
              Por seguridad, todas las sesiones activas han sido cerradas.
            </p>
          </div>

          <Link
            href="/login"
            className="btn w-full bg-accent text-white hover:brightness-110 transition-all duration-200"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

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
          
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <KeyIcon className="h-8 w-8 text-accent" />
          </div>

          <h1 className="text-3xl font-bold text-primary text-center">
            Nueva Contraseña
          </h1>
          
          <p className="text-sm text-center text-muted">
            Ingresa tu nueva contraseña para completar la recuperación
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                className={`w-full input input-bordered pr-10 bg-surface-secondary border ${
                  errors.password ? "border-error" : "border-border"
                } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby="password-error"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
              <p className="mt-1 text-sm text-error" id="password-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="••••••••"
                className={`w-full input input-bordered pr-10 bg-surface-secondary border ${
                  errors.confirmPassword ? "border-error" : "border-border"
                } placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent`}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby="confirmPassword-error"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-error" id="confirmPassword-error">
                {errors.confirmPassword.message}
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
                <span>Actualizando...</span>
              </div>
            ) : (
              "Actualizar contraseña"
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
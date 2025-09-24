'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotFoundProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export default function NotFound({
  title = "Página no encontrada",
  message = "Lo sentimos, la página que buscas no existe o no tienes permisos para acceder a ella.",
  showBackButton = true,
  showHomeButton = true
}: NotFoundProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* Error 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-accent/20 mb-4">404</h1>
          <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
        </div>

        {/* Contenido */}
        <div className="max-w-md mx-auto mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            {title}
          </h2>
          <p className="text-muted leading-relaxed">
            {message}
          </p>
        </div>

        {/* Ilustración simple */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-surface border border-border rounded-full flex items-center justify-center">
            <span className="text-4xl text-muted">🔍</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="btn btn-outline border-accent text-accent hover:bg-accent hover:text-white px-6 py-3"
            >
              ← Volver atrás
            </button>
          )}

          {showHomeButton && (
            <Link
              href="/"
              className="btn bg-accent text-white hover:brightness-110 px-6 py-3"
            >
              🏠 Ir al inicio
            </Link>
          )}
        </div>

        {/* Enlaces útiles */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted mb-4">¿Necesitas ayuda? Prueba con estos enlaces:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/" className="text-accent hover:underline">
              Inicio
            </Link>
            <Link href="/products" className="text-accent hover:underline">
              Productos
            </Link>
            <Link href="/categories" className="text-accent hover:underline">
              Categorías
            </Link>
            <Link href="/about" className="text-accent hover:underline">
              Nosotros
            </Link>
            <Link href="/contact" className="text-accent hover:underline">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
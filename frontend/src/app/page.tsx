"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth/useAuth";
import Link from "next/link";
import {
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  BoltIcon,
  FireIcon,
  SparklesIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirigir admin al dashboard
  useEffect(() => {
    if (!loading && user && (user.role === 'admin' || user.role === 'superadmin')) {
      router.replace('/admin/dashboard');
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si es admin, no mostrar nada (se está redirigiendo)
  if (user && (user.role === 'admin' || user.role === 'superadmin')) {
    return null;
  }

  const slides = [
    {
      title: "Repuestos de Calidad",
      subtitle: "Para todos los modelos de vehículos",
      description: "Encuentra los mejores repuestos automotrices al mejor precio",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=400&fit=crop",
      cta: "Ver Catálogo"
    },
    {
      title: "Envío Express",
      subtitle: "Entrega rápida en todo Chile",
      description: "Recibe tus repuestos en 24-48 horas en todo el país",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=400&fit=crop",
      cta: "Realizar Pedido"
    },
    {
      title: "Asesoría Técnica",
      subtitle: "Expertos a tu servicio",
      description: "Nuestro equipo te ayuda a encontrar el repuesto exacto",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=400&fit=crop",
      cta: "Contactar"
    }
  ];

  const categories = [
    {
      name: "Motor",
      icon: "🔧",
      description: "Pistones, bielas, válvulas y más",
      count: "500+",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    },
    {
      name: "Frenos",
      icon: "🛑",
      description: "Pastillas, discos, líquidos",
      count: "300+",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    },
    {
      name: "Suspensión",
      icon: "⚡",
      description: "Amortiguadores, resortes",
      count: "250+",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    },
    {
      name: "Eléctrico",
      icon: "🔌",
      description: "Baterías, alternadores",
      count: "400+",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    },
    {
      name: "Filtros",
      icon: "🌪️",
      description: "Aire, aceite, combustible",
      count: "200+",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    },
    {
      name: "Transmisión",
      icon: "⚙️",
      description: "Cajas, embragues",
      count: "180+",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    },
    {
      name: "Carrocería",
      icon: "🚗",
      description: "Paneles, espejos",
      count: "320+",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    },
    {
      name: "Aceites",
      icon: "🛢️",
      description: "Lubricantes premium",
      count: "150+",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200"
    }
  ];

  const services = [
    {
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      title: "Garantía Total",
      description: "Todos nuestros productos con garantía de fábrica"
    },
    {
      icon: <TruckIcon className="w-8 h-8" />,
      title: "Envío Express",
      description: "Entrega rápida en Santiago y regiones"
    },
    {
      icon: <ClockIcon className="w-8 h-8" />,
      title: "Atención 24/7",
      description: "Soporte técnico todos los días"
    },
    {
      icon: <CreditCardIcon className="w-8 h-8" />,
      title: "Múltiples Pagos",
      description: "Efectivo, tarjetas y transferencias"
    }
  ];

  const featuredProducts = [
    {
      name: "Pastillas de Freno Brembo",
      brand: "Brembo",
      price: "$45.990",
      originalPrice: "$52.990",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      badge: "OFERTA"
    },
    {
      name: "Filtro de Aire Mann",
      brand: "Mann Filter",
      price: "$12.990",
      originalPrice: "$15.990",
      image: "https://images.unsplash.com/photo-1563330232-57114bb0823c?w=300&h=200&fit=crop",
      badge: "NUEVO"
    },
    {
      name: "Amortiguador Monroe",
      brand: "Monroe",
      price: "$89.990",
      originalPrice: "$95.990",
      image: "https://images.unsplash.com/photo-1563330232-57114bb0823c?w=300&h=200&fit=crop",
      badge: "POPULAR"
    },
    {
      name: "Batería Bosch 75Ah",
      brand: "Bosch",
      price: "$120.990",
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slider Section */}
      <section className="relative h-96 sm:h-[500px] overflow-hidden">
        <div className="relative h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${slide.image}')`
                }}
              >
                <div className="container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-8">
                  <div className="text-white max-w-2xl">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                      {slide.title}
                    </h1>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl mb-3 sm:mb-4 text-accent">
                      {slide.subtitle}
                    </h2>
                    <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                      {slide.description}
                    </p>
                    <Link href={slide.cta === "Ver Catálogo" ? "/categories" : "/categories"} className="btn bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-none">
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-accent' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-8 sm:py-12 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-center p-4 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="text-accent mr-4 flex-shrink-0">
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-primary text-sm sm:text-base">{service.title}</h3>
                  <p className="text-muted text-xs sm:text-sm">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Categorías de Productos
            </h2>
            <p className="text-lg sm:text-xl text-muted">
              Encuentra repuestos para todas las partes de tu vehículo
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={`/categories/${category.name.toLowerCase()}`}>
                <div className={`${category.color} border-2 rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-primary mb-1 sm:mb-2 text-sm sm:text-base">
                    {category.name}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm mb-2 sm:mb-3">
                    {category.description}
                  </p>
                  <span className="inline-block bg-accent text-white text-xs px-2 py-1 rounded-full">
                    {category.count} productos
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Productos Destacados
            </h2>
            <p className="text-lg sm:text-xl text-muted">
              Los repuestos más vendidos y recomendados
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div key={index} className="bg-background rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white ${
                      product.badge === 'OFERTA' ? 'bg-red-500' :
                      product.badge === 'NUEVO' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}>
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <div className="text-sm text-muted mb-1">{product.brand}</div>
                  <h3 className="font-semibold text-primary mb-3 text-sm sm:text-base line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-accent">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted line-through ml-2">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                    <button className="btn btn-sm bg-accent hover:bg-accent/90 text-white border-none">
                      <ShoppingCartIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/categories" className="btn bg-accent hover:bg-accent/90 text-white px-8 py-3 border-none">
              Ver Todas las Categorías
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">
              ¿Por qué elegir Repuestos Victoria?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">15+ Años de Experiencia</h3>
              <p className="text-muted">
                Más de una década sirviendo a la industria automotriz con excelencia y confiabilidad.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Calidad Garantizada</h3>
              <p className="text-muted">
                Solo trabajamos con marcas reconocidas y todos nuestros productos tienen garantía.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Atención Personalizada</h3>
              <p className="text-muted">
                Nuestro equipo de expertos te ayuda a encontrar exactamente lo que necesitas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-accent to-accent/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Necesitas ayuda para encontrar un repuesto?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8">
            Contáctanos y nuestros expertos te ayudarán a encontrar exactamente lo que necesitas
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/contact" className="w-full sm:w-auto btn bg-white text-accent hover:bg-gray-100 px-6 sm:px-8 py-3 border-none">
              <PhoneIcon className="w-5 h-5 mr-2" />
              Llamar Ahora
            </Link>
            <Link href="/whatsapp" className="w-full sm:w-auto btn btn-outline border-white text-white hover:bg-white hover:text-accent px-6 sm:px-8 py-3">
              <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
              WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
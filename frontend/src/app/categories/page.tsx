"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronRightIcon,
  HomeIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";

export default function CategoriesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const categories = [
    {
      id: 1,
      name: "Motor",
      icon: "🔧",
      description: "Pistones, bielas, válvulas, juntas y todos los componentes internos del motor",
      count: 520,
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Pistones", "Bielas", "Válvulas", "Juntas", "Filtros de Aceite"]
    },
    {
      id: 2,
      name: "Frenos",
      icon: "🛑",
      description: "Pastillas, discos, tambores, líquidos y todo el sistema de frenado",
      count: 340,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Pastillas", "Discos", "Tambores", "Líquidos", "Mangueras"]
    },
    {
      id: 3,
      name: "Suspensión",
      icon: "⚡",
      description: "Amortiguadores, resortes, rótulas y componentes de suspensión",
      count: 280,
      image: "https://images.unsplash.com/photo-1563330232-57114bb0823c?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Amortiguadores", "Resortes", "Rótulas", "Terminales", "Barras"]
    },
    {
      id: 4,
      name: "Eléctrico",
      icon: "🔌",
      description: "Baterías, alternadores, motores de arranque y sistema eléctrico",
      count: 450,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Baterías", "Alternadores", "Motores de Arranque", "Cables", "Fusibles"]
    },
    {
      id: 5,
      name: "Filtros",
      icon: "🌪️",
      description: "Filtros de aire, aceite, combustible y habitáculo",
      count: 220,
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Aire", "Aceite", "Combustible", "Habitáculo", "Hidráulicos"]
    },
    {
      id: 6,
      name: "Transmisión",
      icon: "⚙️",
      description: "Cajas de cambio, embragues, diferenciales y transmisión",
      count: 190,
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Caja Manual", "Caja Automática", "Embragues", "Diferenciales", "Juntas"]
    },
    {
      id: 7,
      name: "Carrocería",
      icon: "🚗",
      description: "Paneles, espejos, luces y accesorios externos",
      count: 380,
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Paneles", "Espejos", "Luces", "Parachoques", "Molduras"]
    },
    {
      id: 8,
      name: "Aceites",
      icon: "🛢️",
      description: "Lubricantes, aceites de motor, transmisión y hidráulicos",
      count: 160,
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Motor", "Transmisión", "Frenos", "Dirección", "Refrigerante"]
    },
    {
      id: 9,
      name: "Climatización",
      icon: "❄️",
      description: "Aire acondicionado, calefacción y ventilación",
      count: 150,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      color: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200",
      subcategories: ["Compresores", "Condensadores", "Evaporadores", "Filtros", "Gases"]
    },
    {
      id: 10,
      name: "Dirección",
      icon: "🎯",
      description: "Cremalleras, bombas hidráulicas y componentes de dirección",
      count: 140,
      image: "https://images.unsplash.com/photo-1563330232-57114bb0823c?w=400&h=300&fit=crop",
      color: "bg-teal-50 hover:bg-teal-100 border-teal-200",
      subcategories: ["Cremalleras", "Bombas", "Mangueras", "Depósitos", "Rótulas"]
    },
    {
      id: 11,
      name: "Escape",
      icon: "💨",
      description: "Tubos de escape, silenciadores y catalizadores",
      count: 120,
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
      color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
      subcategories: ["Silenciadores", "Catalizadores", "Tubos", "Sensores", "Abrazaderas"]
    },
    {
      id: 12,
      name: "Combustible",
      icon: "⛽",
      description: "Bombas, inyectores y sistema de combustible",
      count: 180,
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      subcategories: ["Bombas", "Inyectores", "Filtros", "Sensores", "Mangueras"]
    }
  ];

  const filters = [
    { id: 'all', name: 'Todas las categorías', count: categories.length },
    { id: 'motor', name: 'Motor y Transmisión', count: 4 },
    { id: 'seguridad', name: 'Seguridad', count: 3 },
    { id: 'mantenimiento', name: 'Mantenimiento', count: 3 },
    { id: 'exterior', name: 'Exterior', count: 2 }
  ];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'all') return matchesSearch;

    // Simple filter logic - you can make this more sophisticated
    const filterCategories = {
      motor: ['Motor', 'Transmisión', 'Combustible', 'Aceites'],
      seguridad: ['Frenos', 'Suspensión', 'Dirección'],
      mantenimiento: ['Filtros', 'Eléctrico', 'Climatización'],
      exterior: ['Carrocería', 'Escape']
    };

    return matchesSearch && filterCategories[selectedFilter as keyof typeof filterCategories]?.includes(category.name);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-surface border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-muted hover:text-accent transition-colors">
              <HomeIcon className="w-4 h-4" />
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-muted" />
            <span className="text-primary font-medium">Categorías</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-accent/90 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Categorías de Repuestos
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-3xl mx-auto">
              Explora nuestra amplia gama de repuestos automotrices organizados por categorías.
              Encuentra exactamente lo que necesitas para tu vehículo.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Buscar categorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10 bg-surface"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-muted" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="select select-bordered bg-surface text-sm"
              >
                {filters.map(filter => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name} ({filter.count})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-border rounded-lg p-1 bg-surface">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-accent text-white' : 'text-muted hover:text-primary'}`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted">
            Mostrando {filteredCategories.length} de {categories.length} categorías
          </p>
        </div>

        {/* Categories Grid/List */}
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredCategories.map((category) => (
            <Link key={category.id} href={`/categories/${category.name.toLowerCase()}`}>
              {viewMode === 'grid' ? (
                /* Grid View */
                <div className="group cursor-pointer">
                  <div className={`${category.color} border-2 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center mb-2">
                          <span className="text-3xl mr-2">{category.icon}</span>
                          <h3 className="text-xl font-bold">{category.name}</h3>
                        </div>
                        <span className="inline-block bg-accent text-white text-xs px-2 py-1 rounded-full">
                          {category.count} productos
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <p className="text-muted text-sm mb-4 leading-relaxed">
                        {category.description}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-primary mb-2">Subcategorías:</p>
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.slice(0, 3).map((sub, index) => (
                            <span key={index} className="text-xs bg-surface px-2 py-1 rounded text-muted">
                              {sub}
                            </span>
                          ))}
                          {category.subcategories.length > 3 && (
                            <span className="text-xs text-accent">
                              +{category.subcategories.length - 3} más
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="group cursor-pointer">
                  <div className={`${category.color} border-2 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg bg-white/50 flex items-center justify-center">
                          <span className="text-3xl">{category.icon}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors">
                            {category.name}
                          </h3>
                          <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">
                            {category.count} productos
                          </span>
                        </div>
                        <p className="text-muted mb-4 leading-relaxed">
                          {category.description}
                        </p>
                        <div>
                          <p className="text-xs font-medium text-primary mb-2">Subcategorías disponibles:</p>
                          <div className="flex flex-wrap gap-2">
                            {category.subcategories.map((sub, index) => (
                              <span key={index} className="text-xs bg-white px-3 py-1 rounded-full text-muted border border-border">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <ChevronRightIcon className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-primary mb-2">No se encontraron categorías</h3>
            <p className="text-muted mb-6">
              Intenta con otros términos de búsqueda o cambia los filtros.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('all');
              }}
              className="btn bg-accent hover:bg-accent/90 text-white"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-surface mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-lg sm:text-xl text-muted mb-6 sm:mb-8">
            Nuestro equipo de expertos está listo para ayudarte a encontrar el repuesto exacto que necesitas
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/contact" className="w-full sm:w-auto btn bg-accent hover:bg-accent/90 text-white px-6 sm:px-8 py-3 border-none">
              Contactar Asesor
            </Link>
            <Link href="/search" className="w-full sm:w-auto btn btn-outline border-accent text-accent hover:bg-accent hover:text-white px-6 sm:px-8 py-3">
              Búsqueda Avanzada
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { ChevronDownIcon, Bars3Icon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface CategoryLayoutProps {
  children: ReactNode;
  params: { category: string };
}

const brands = [
  'Toyota', 'Chevrolet', 'Ford', 'Hyundai', 'Kia', 'Nissan', 'Mitsubishi', 'Suzuki',
  'Mazda', 'Honda', 'Volkswagen', 'Peugeot', 'Renault', 'Fiat', 'BMW', 'Mercedes-Benz'
];

const years = Array.from({ length: 30 }, (_, i) => 2024 - i);

const models = {
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Prius', 'Yaris', 'Hilux', 'Land Cruiser'],
  Chevrolet: ['Sail', 'Spark', 'Cruze', 'Captiva', 'Onix', 'Tracker', 'Colorado'],
  Ford: ['Fiesta', 'Focus', 'EcoSport', 'Escape', 'Explorer', 'F-150', 'Ranger'],
  Hyundai: ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'i10', 'i20', 'Creta'],
  Kia: ['Rio', 'Forte', 'Sportage', 'Sorento', 'Picanto', 'Cerato', 'Soul'],
  Nissan: ['Versa', 'Sentra', 'Altima', 'X-Trail', 'Qashqai', 'Frontier', 'Pathfinder'],
  Mitsubishi: ['Mirage', 'Lancer', 'ASX', 'Outlander', 'Montero', 'L200', 'Eclipse Cross'],
  Suzuki: ['Alto', 'Swift', 'Baleno', 'Vitara', 'S-Cross', 'Jimny', 'Ertiga'],
  Mazda: ['Mazda2', 'Mazda3', 'CX-3', 'CX-5', 'CX-9', 'BT-50', 'MX-5'],
  Honda: ['City', 'Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Ridgeline'],
  Volkswagen: ['Polo', 'Golf', 'Jetta', 'Tiguan', 'Touareg', 'Amarok', 'Atlas'],
  Peugeot: ['208', '308', '3008', '5008', '2008', 'Partner', 'Expert'],
  Renault: ['Clio', 'Megane', 'Captur', 'Koleos', 'Duster', 'Logan', 'Sandero'],
  Fiat: ['Uno', 'Argo', '500', 'Toro', 'Mobi', 'Cronos', 'Strada'],
  BMW: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5', 'Z4'],
  'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'GLA', 'GLC', 'GLE', 'Sprinter']
};

const categories = [
  {
    id: 1,
    name: "Motor",
    slug: "motor",
    subcategories: [
      { id: 1, name: "Pistones y Anillos", slug: "pistones-anillos" },
      { id: 2, name: "Válvulas y Guías", slug: "valvulas-guias" },
      { id: 3, name: "Bielas y Cigüeñales", slug: "bielas-ciguenales" },
      { id: 4, name: "Juntas Motor", slug: "juntas-motor" },
      { id: 5, name: "Bombas de Aceite", slug: "bombas-aceite" }
    ]
  },
  {
    id: 2,
    name: "Transmisión",
    slug: "transmision",
    subcategories: [
      { id: 6, name: "Embragues", slug: "embragues" },
      { id: 7, name: "Cajas de Cambio", slug: "cajas-cambio" },
      { id: 8, name: "Diferenciales", slug: "diferenciales" },
      { id: 9, name: "Juntas Homocinéticas", slug: "juntas-homocineticas" },
      { id: 10, name: "Discos y Prensa", slug: "discos-prensa" }
    ]
  },
  {
    id: 3,
    name: "Frenos",
    slug: "frenos",
    subcategories: [
      { id: 11, name: "Pastillas de Freno", slug: "pastillas-freno" },
      { id: 12, name: "Discos de Freno", slug: "discos-freno" },
      { id: 13, name: "Bombas de Freno", slug: "bombas-freno" },
      { id: 14, name: "Líquidos de Freno", slug: "liquidos-freno" },
      { id: 15, name: "Cables de Freno", slug: "cables-freno" }
    ]
  }
];

export default function CategoryLayout({ children, params }: CategoryLayoutProps) {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);

  const availableModels = selectedBrand ? models[selectedBrand as keyof typeof models] || [] : [];

  useEffect(() => {
    if (selectedBrand && !availableModels.includes(selectedModel)) {
      setSelectedModel('');
    }
  }, [selectedBrand, selectedModel, availableModels]);

  const toggleCategory = (categoryId: number) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setSelectedYear('');
    setPriceRange([0, 1000000]);
    setInStock(false);
    setOnSale(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con Comboboxes */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              <h1 className="text-xl font-semibold text-gray-900 capitalize">
                {decodeURIComponent(params.category).replace(/-/g, ' ')}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Combobox Marca */}
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-[120px]"
                >
                  <option value="">Marca</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Combobox Modelo */}
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={!selectedBrand}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-[120px] disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Modelo</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Combobox Año */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-w-[100px]"
                >
                  <option value="">Año</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block w-80 bg-white shadow-sm border-r border-gray-200 min-h-[calc(100vh-64px)]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filtros
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Limpiar
              </button>
            </div>

            {/* Categorías */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Categorías</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id}>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex items-center justify-between w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <span className="text-gray-700">{category.name}</span>
                      <ChevronDownIcon
                        className={`h-4 w-4 text-gray-400 transform transition-transform ${
                          openCategories.includes(category.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openCategories.includes(category.id) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.subcategories.map(sub => (
                          <a
                            key={sub.id}
                            href={`/categories/${category.slug}/${sub.slug}`}
                            className="block py-1 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                          >
                            {sub.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Rango de Precio */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Precio</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0] || ''}
                    onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1] || ''}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Disponibilidad */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Disponibilidad</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">En stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={onSale}
                    onChange={(e) => setOnSale(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">En oferta</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-white w-80 max-w-sm flex flex-col shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {/* Same content as desktop sidebar */}
                <div className="space-y-6">
                  {/* Categorías */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Categorías</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <div key={category.id}>
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="flex items-center justify-between w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            <span className="text-gray-700">{category.name}</span>
                            <ChevronDownIcon
                              className={`h-4 w-4 text-gray-400 transform transition-transform ${
                                openCategories.includes(category.id) ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {openCategories.includes(category.id) && (
                            <div className="ml-4 mt-1 space-y-1">
                              {category.subcategories.map(sub => (
                                <a
                                  key={sub.id}
                                  href={`/categories/${category.slug}/${sub.slug}`}
                                  className="block py-1 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  {sub.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resto de filtros igual que desktop */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Precio</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0] || ''}
                        onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1] || ''}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Disponibilidad</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={inStock}
                          onChange={(e) => setInStock(e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">En stock</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={onSale}
                          onChange={(e) => setOnSale(e.target.checked)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">En oferta</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
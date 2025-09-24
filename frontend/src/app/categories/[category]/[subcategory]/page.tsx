'use client';

import { useState, useEffect } from 'react';
import {
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ShoppingCartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  brand: string;
  model?: string;
  year?: string;
  category: string;
  subcategory?: string;
  isOnSale?: boolean;
  discount?: number;
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Pastillas de Freno Delanteras Cerámicas",
    description: "Pastillas de freno cerámicas de alta calidad para mayor durabilidad y rendimiento",
    price: 45000,
    originalPrice: 55000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    rating: 4.5,
    reviews: 28,
    inStock: true,
    brand: "Toyota",
    model: "Corolla",
    year: "2020-2024",
    category: "frenos",
    subcategory: "pastillas-freno",
    isOnSale: true,
    discount: 18
  },
  {
    id: 2,
    name: "Pastillas de Freno Traseras Semi-Metálicas",
    description: "Pastillas traseras con compuesto semi-metálico para máximo frenado",
    price: 38000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    rating: 4.3,
    reviews: 15,
    inStock: true,
    brand: "Chevrolet",
    model: "Sail",
    year: "2018-2023",
    category: "frenos",
    subcategory: "pastillas-freno"
  },
  {
    id: 3,
    name: "Kit Pastillas Freno Completo",
    description: "Kit completo con pastillas delanteras y traseras incluye sensores",
    price: 85000,
    originalPrice: 95000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    rating: 4.7,
    reviews: 22,
    inStock: true,
    brand: "Ford",
    model: "Fiesta",
    year: "2019-2024",
    category: "frenos",
    subcategory: "pastillas-freno",
    isOnSale: true,
    discount: 11
  },
  {
    id: 4,
    name: "Pastillas de Freno Sport Performance",
    description: "Pastillas de alto rendimiento para conducción deportiva",
    price: 65000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    rating: 4.8,
    reviews: 33,
    inStock: false,
    brand: "Hyundai",
    model: "Accent",
    year: "2017-2023",
    category: "frenos",
    subcategory: "pastillas-freno"
  },
  {
    id: 5,
    name: "Pastillas Freno Económicas",
    description: "Pastillas de freno básicas para uso urbano, excelente relación precio-calidad",
    price: 25000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    rating: 4.1,
    reviews: 45,
    inStock: true,
    brand: "Kia",
    model: "Rio",
    year: "2020-2024",
    category: "frenos",
    subcategory: "pastillas-freno"
  },
  {
    id: 6,
    name: "Pastillas Freno Heavy Duty",
    description: "Pastillas reforzadas para vehículos de carga pesada",
    price: 55000,
    originalPrice: 68000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    rating: 4.4,
    reviews: 18,
    inStock: true,
    brand: "Nissan",
    model: "Frontier",
    year: "2018-2023",
    category: "frenos",
    subcategory: "pastillas-freno",
    isOnSale: true,
    discount: 19
  }
];

export default function SubcategoryPage({ params }: { params: { category: string; subcategory: string } }) {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const categoryName = decodeURIComponent(params.category).replace(/-/g, ' ');
  const subcategoryName = decodeURIComponent(params.subcategory).replace(/-/g, ' ');

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = product.category === params.category;
      const matchesSubcategory = product.subcategory === params.subcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, sortBy, params.category, params.subcategory]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200 group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {product.isOnSale && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            -{product.discount}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded text-xs">
            Agotado
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button className="bg-white text-gray-900 p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {product.name}
        </h3>

        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {product.brand} {product.model}
          </div>
        </div>

        <button
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
            product.inStock
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCartIcon className="h-4 w-4" />
          <span>{product.inStock ? 'Agregar al carrito' : 'No disponible'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                Inicio
              </a>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <a href="/categories" className="text-gray-500 hover:text-gray-700 text-sm">
                Categorías
              </a>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <a
                href={`/categories/${params.category}`}
                className="text-gray-500 hover:text-gray-700 capitalize text-sm"
              >
                {categoryName}
              </a>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 capitalize text-sm font-medium">
                {subcategoryName}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize mb-2">
                {subcategoryName}
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} productos en {categoryName} › {subcategoryName}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar en ${subcategoryName}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                <option value="relevance">Relevancia</option>
                <option value="price-low">Precio: Menor a mayor</option>
                <option value="price-high">Precio: Mayor a menor</option>
                <option value="rating">Mejor valorados</option>
                <option value="name">Nombre A-Z</option>
              </select>

              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros o términos de búsqueda
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border rounded-lg text-sm ${
                  currentPage === page
                    ? 'bg-red-600 text-white border-red-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
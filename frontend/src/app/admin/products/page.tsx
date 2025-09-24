'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
    PlusIcon,
    DocumentArrowUpIcon,
    DocumentArrowDownIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    StarIcon
} from '@heroicons/react/24/outline';

interface Product {
    id: number;
    nombre: string;
    categoria_nombre: string;
    subcategoria_nombre?: string;
    descripcion?: string;
    precio: number;
    stock: number;
    sku: string;
    imagen_url?: string;
    activo: boolean;
    destacado: boolean;
    peso?: number;
    dimensiones?: string;
    garantia_meses?: number;
    id_categoria: number;
    id_subcategoria?: number;
}

interface Category {
    id: number;
    nombre: string;
    activa: boolean;
}

interface Subcategory {
    id: number;
    nombre: string;
    id_categoria: number;
    activa: boolean;
}

interface ImportResult {
    total: number;
    created: number;
    skipped: number;
    errors: string[];
}

interface ProductFormData {
    nombre: string;
    descripcion: string;
    precio: string;
    stock: string;
    sku: string;
    imagen_url: string;
    id_categoria: string;
    id_subcategoria: string;
    activo: boolean;
    destacado: boolean;
    peso: string;
    dimensiones: string;
    garantia_meses: string;
}

export default function AdminProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Form data
    const [formData, setFormData] = useState<ProductFormData>({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '0',
        sku: '',
        imagen_url: '',
        id_categoria: '',
        id_subcategoria: '',
        activo: true,
        destacado: false,
        peso: '',
        dimensiones: '',
        garantia_meses: ''
    });

    // Import states
    const [fileData, setFileData] = useState<any[]>([]);
    const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchSubcategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            console.log('Products response:', response.data);

            // Try different possible response structures
            if (response.data.success && response.data.data) {
                setProducts(response.data.data);
            } else if (response.data.products) {
                setProducts(response.data.products);
            } else if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else {
                setProducts([]);
                console.warn('Unexpected products response structure:', response.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            console.log('Categories response:', response.data);

            if (response.data.success && response.data.data) {
                setCategories(response.data.data);
            } else if (response.data.categories) {
                setCategories(response.data.categories);
            } else if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                setCategories([]);
                console.warn('Unexpected categories response structure:', response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchSubcategories = async () => {
        try {
            const response = await api.get('/subcategories');
            console.log('Subcategories response:', response.data);

            if (response.data.success && response.data.data) {
                setSubcategories(response.data.data);
            } else if (response.data.subcategories) {
                setSubcategories(response.data.subcategories);
            } else if (Array.isArray(response.data)) {
                setSubcategories(response.data);
            } else {
                setSubcategories([]);
                console.warn('Unexpected subcategories response structure:', response.data);
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            setSubcategories([]);
        }
    };

    const getFilteredSubcategories = (categoryId: string) => {
        if (!categoryId) return [];
        return subcategories.filter(sub => sub.id_categoria === parseInt(categoryId) && sub.activa);
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            precio: '',
            stock: '0',
            sku: '',
            imagen_url: '',
            id_categoria: '',
            id_subcategoria: '',
            activo: true,
            destacado: false,
            peso: '',
            dimensiones: '',
            garantia_meses: ''
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingProduct(null);
        resetForm();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));

            // Reset subcategory when category changes
            if (name === 'id_categoria') {
                setFormData(prev => ({ ...prev, id_subcategoria: '' }));
            }
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const productData = {
                ...formData,
                precio: parseFloat(formData.precio),
                stock: parseInt(formData.stock),
                id_categoria: parseInt(formData.id_categoria),
                id_subcategoria: formData.id_subcategoria ? parseInt(formData.id_subcategoria) : null,
                peso: formData.peso ? parseFloat(formData.peso) : null,
                garantia_meses: formData.garantia_meses ? parseInt(formData.garantia_meses) : null
            };

            await api.post('/products', productData);
            toast.success('Producto creado exitosamente');
            closeModal();
            fetchProducts();
        } catch (error: any) {
            console.error('Error creating product:', error);
            toast.error(error.response?.data?.message || 'Error al crear producto');
        }
    };

    const handleEditProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            const productData = {
                ...formData,
                precio: parseFloat(formData.precio),
                stock: parseInt(formData.stock),
                id_categoria: parseInt(formData.id_categoria),
                id_subcategoria: formData.id_subcategoria ? parseInt(formData.id_subcategoria) : null,
                peso: formData.peso ? parseFloat(formData.peso) : null,
                garantia_meses: formData.garantia_meses ? parseInt(formData.garantia_meses) : null
            };

            await api.put(`/products/${editingProduct.id}`, productData);
            toast.success('Producto actualizado exitosamente');
            closeModal();
            fetchProducts();
        } catch (error: any) {
            console.error('Error updating product:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar producto');
        }
    };

    const handleDeleteProduct = async (product: Product) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${product.nombre}"?`)) {
            return;
        }

        try {
            await api.delete(`/products/${product.id}`);
            toast.success('Producto eliminado exitosamente');
            fetchProducts();
        } catch (error: any) {
            console.error('Error deleting product:', error);
            toast.error(error.response?.data?.message || 'Error al eliminar producto');
        }
    };

    const handleToggleProductStatus = async (product: Product, field: 'activo' | 'destacado') => {
        try {
            const updatedData = { [field]: !product[field] };
            await api.put(`/products/${product.id}`, updatedData);
            toast.success(`Producto ${field === 'activo' ? (product.activo ? 'desactivado' : 'activado') : (product.destacado ? 'ya no destacado' : 'destacado')} exitosamente`);
            fetchProducts();
        } catch (error: any) {
            console.error(`Error updating product ${field}:`, error);
            toast.error(error.response?.data?.message || `Error al ${field === 'activo' ? 'cambiar estado' : 'destacar'} producto`);
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            nombre: product.nombre,
            descripcion: product.descripcion || '',
            precio: product.precio.toString(),
            stock: product.stock.toString(),
            sku: product.sku,
            imagen_url: product.imagen_url || '',
            id_categoria: product.id_categoria.toString(),
            id_subcategoria: product.id_subcategoria?.toString() || '',
            activo: product.activo,
            destacado: product.destacado,
            peso: product.peso?.toString() || '',
            dimensiones: product.dimensiones || '',
            garantia_meses: product.garantia_meses?.toString() || ''
        });
        setShowEditModal(true);
    };

    // Excel Import Functions
    const downloadTemplate = () => {
        const templateData = [
            {
                'Nombre': 'Ejemplo Producto',
                'Categoria': 'Categoria Ejemplo',
                'Subcategoria': 'Subcategoria Ejemplo',
                'Descripcion': 'Descripción del producto ejemplo',
                'Precio': 99.99,
                'Stock': 10,
                'SKU': 'EJEMPLO001',
                'Imagen URL': 'https://ejemplo.com/imagen.jpg',
                'Activo': 1,
                'Destacado': 0,
                'Peso': 1.5,
                'Dimensiones': '10x20x30 cm',
                'Garantía (meses)': 12
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

        // Ajustar ancho de columnas
        const colWidths = [
            { wch: 20 }, // Nombre
            { wch: 15 }, // Categoria
            { wch: 15 }, // Subcategoria
            { wch: 30 }, // Descripcion
            { wch: 10 }, // Precio
            { wch: 8 },  // Stock
            { wch: 12 }, // SKU
            { wch: 25 }, // Imagen URL
            { wch: 8 },  // Activo
            { wch: 10 }, // Destacado
            { wch: 8 },  // Peso
            { wch: 15 }, // Dimensiones
            { wch: 12 }  // Garantía (meses)
        ];
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, 'plantilla_productos.xlsx');
        toast.success('Plantilla descargada exitosamente');
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(worksheet);

            const products = data.map((row: any) => ({
                nombre: row.Nombre || row.nombre || row.Name || row.NOMBRE,
                categoria: row.Categoria || row.categoria || row.Category || row.CATEGORIA,
                subcategoria: row.Subcategoria || row.subcategoria || row.Subcategory || row.SUBCATEGORIA,
                descripcion: row.Descripcion || row.descripcion || row.Description || row.DESCRIPCION,
                precio: row.Precio || row.precio || row.Price || row.PRECIO,
                stock: row.Stock || row.stock || row.STOCK,
                sku: row.SKU || row.sku || row.Sku,
                imagen_url: row['Imagen URL'] || row.imagen_url || row['Image URL'] || row.IMAGEN_URL,
                activo: row.Activo !== undefined ? Boolean(row.Activo) : (row.activo !== undefined ? Boolean(row.activo) : true),
                destacado: row.Destacado !== undefined ? Boolean(row.Destacado) : (row.destacado !== undefined ? Boolean(row.destacado) : false),
                peso: row.Peso || row.peso || row.Weight || row.PESO,
                dimensiones: row.Dimensiones || row.dimensiones || row.Dimensions || row.DIMENSIONES,
                garantia_meses: row['Garantía (meses)'] || row.garantia_meses || row.warranty_months || row.GARANTIA_MESES
            }));

            setFileData(products);
        } catch (error) {
            console.error('Error processing file:', error);
            toast.error('Error al procesar el archivo Excel');
        }
    };

    const handleImport = async () => {
        if (fileData.length === 0) {
            toast.error('Por favor selecciona un archivo primero');
            return;
        }

        try {
            setImportStatus('processing');
            setImportResult(null);

            const response = await api.post('/bulk-import/products', {
                products: fileData
            });

            setImportResult(response.data.results);
            setImportStatus('completed');

            if (response.data.results.created > 0) {
                toast.success(`¡Importación exitosa! ${response.data.results.created} productos creados`);
                fetchProducts();
            }

            if (response.data.results.skipped > 0) {
                toast.info(`${response.data.results.skipped} productos omitidos (ya existían)`);
            }
        } catch (error: any) {
            console.error('Error importing products:', error);
            setImportStatus('error');
            toast.error('Error al importar productos');

            if (error.response?.data?.results) {
                setImportResult(error.response.data.results);
            }
        }
    };

    const resetImport = () => {
        setShowImportModal(false);
        setFileData([]);
        setImportStatus('idle');
        setImportResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.id_categoria.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="px-4 py-6 sm:px-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Gestiona todos los productos del inventario
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Nuevo Producto
                                </button>
                                <button
                                    onClick={() => setShowImportModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                                    Importar Excel
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                                    Buscar productos
                                </label>
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Buscar por nombre o SKU..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">
                                    Filtrar por categoría
                                </label>
                                <select
                                    id="category-filter"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="px-4 sm:px-0">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto h-12 w-12 text-gray-400">
                                    📦
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Comienza creando un nuevo producto.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Nuevo Producto
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    {filteredProducts.map((product) => (
                                        <li key={product.id}>
                                            <div className="px-4 py-4 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-16 w-16">
                                                        {product.imagen_url ? (
                                                            <img
                                                                className="h-16 w-16 rounded-lg object-cover"
                                                                src={product.imagen_url}
                                                                alt={product.nombre}
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                <span className="text-2xl">📦</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <div className="flex items-center">
                                                            <h3 className="text-lg font-medium text-gray-900">
                                                                {product.nombre}
                                                            </h3>
                                                            {product.destacado && (
                                                                <StarIcon className="ml-2 h-5 w-5 text-yellow-400 fill-current" />
                                                            )}
                                                        </div>
                                                        <div className="mt-1 flex items-center space-x-4">
                                                            <span className="text-sm text-gray-500">
                                                                SKU: {product.sku}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {product.categoria_nombre}
                                                                {product.subcategoria_nombre && ` → ${product.subcategoria_nombre}`}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 flex items-center space-x-4">
                                                            <span className="text-lg font-semibold text-green-600">
                                                                ${product.precio.toLocaleString()}
                                                            </span>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                product.stock > 0
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                Stock: {product.stock}
                                                            </span>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                product.activo
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {product.activo ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar producto"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleProductStatus(product, 'activo')}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            product.activo
                                                                ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                                        }`}
                                                        title={product.activo ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {product.activo ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleProductStatus(product, 'destacado')}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            product.destacado
                                                                ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                                                                : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                                                        }`}
                                                        title={product.destacado ? 'Quitar destacado' : 'Destacar'}
                                                    >
                                                        <StarIcon className={`h-5 w-5 ${product.destacado ? 'fill-current' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product)}
                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar producto"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create/Edit Product Modal */}
                {(showCreateModal || showEditModal) && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                                </h3>
                                <form onSubmit={editingProduct ? handleEditProduct : handleCreateProduct} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Nombre del producto *
                                            </label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="Ej: Filtro de aceite motor"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                SKU *
                                            </label>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="Ej: FILT-001"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Precio *
                                            </label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="precio"
                                                    value={formData.precio}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="pl-7 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Stock
                                            </label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Categoría *
                                            </label>
                                            <select
                                                name="id_categoria"
                                                value={formData.id_categoria}
                                                onChange={handleInputChange}
                                                required
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {categories.filter(cat => cat.activa).map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Subcategoría
                                            </label>
                                            <select
                                                name="id_subcategoria"
                                                value={formData.id_subcategoria}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            >
                                                <option value="">Seleccionar subcategoría</option>
                                                {getFilteredSubcategories(formData.id_categoria).map(subcategory => (
                                                    <option key={subcategory.id} value={subcategory.id}>
                                                        {subcategory.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Descripción
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="Describe las características principales del producto..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Peso (kg)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                name="peso"
                                                value={formData.peso}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="0.000"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Dimensiones
                                            </label>
                                            <input
                                                type="text"
                                                name="dimensiones"
                                                value={formData.dimensiones}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="10x20x5 cm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Garantía (meses)
                                            </label>
                                            <input
                                                type="number"
                                                name="garantia_meses"
                                                value={formData.garantia_meses}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="12"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            URL de Imagen
                                        </label>
                                        <input
                                            type="url"
                                            name="imagen_url"
                                            value={formData.imagen_url}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center">
                                            <input
                                                id="activo"
                                                name="activo"
                                                type="checkbox"
                                                checked={formData.activo}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                                                Producto activo
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="destacado"
                                                name="destacado"
                                                type="checkbox"
                                                checked={formData.destacado}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="destacado" className="ml-2 block text-sm text-gray-900">
                                                Producto destacado
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6 border-t">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            {editingProduct ? 'Actualizar' : 'Crear'} Producto
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Importar Productos desde Excel
                                </h3>

                                {importStatus === 'idle' && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-md">
                                            <div className="text-sm text-blue-800">
                                                <p><strong>Columnas requeridas:</strong> Nombre, Categoria, Precio, SKU</p>
                                                <p><strong>Columnas opcionales:</strong> Subcategoria, Descripcion, Stock, Imagen URL, Activo, Destacado, Peso, Dimensiones, Garantía (meses)</p>
                                            </div>
                                            <div className="mt-3">
                                                <button
                                                    onClick={downloadTemplate}
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <DocumentArrowDownIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                                    Descargar Plantilla Excel
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Seleccionar archivo Excel
                                            </label>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleFileSelect}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>

                                        {fileData.length > 0 && (
                                            <div className="bg-green-50 p-4 rounded-md">
                                                <p className="text-sm text-green-800">
                                                    ✅ Archivo procesado correctamente: {fileData.length} productos encontrados
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {importStatus === 'processing' && (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-sm text-gray-600">Importando productos...</p>
                                    </div>
                                )}

                                {importStatus === 'completed' && importResult && (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 p-4 rounded-md">
                                            <h4 className="text-sm font-medium text-green-800 mb-2">
                                                ✅ Importación completada
                                            </h4>
                                            <div className="text-sm text-green-700 space-y-1">
                                                <p>Total procesados: {importResult.total}</p>
                                                <p>Productos creados: {importResult.created}</p>
                                                <p>Productos omitidos: {importResult.skipped}</p>
                                                <p>Errores: {importResult.errors.length}</p>
                                            </div>
                                        </div>

                                        {importResult.errors.length > 0 && (
                                            <div className="bg-red-50 p-4 rounded-md max-h-40 overflow-y-auto">
                                                <h4 className="text-sm font-medium text-red-800 mb-2">
                                                    Errores encontrados:
                                                </h4>
                                                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                                                    {importResult.errors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {importStatus === 'error' && (
                                    <div className="bg-red-50 p-4 rounded-md">
                                        <h4 className="text-sm font-medium text-red-800">
                                            ❌ Error en la importación
                                        </h4>
                                        <p className="text-sm text-red-700 mt-1">
                                            Hubo un problema al procesar el archivo. Verifica el formato e intenta nuevamente.
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-6 border-t">
                                    {importStatus === 'idle' && fileData.length > 0 && (
                                        <button
                                            onClick={handleImport}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Importar Productos
                                        </button>
                                    )}
                                    <button
                                        onClick={resetImport}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {importStatus === 'completed' ? 'Cerrar' : 'Cancelar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
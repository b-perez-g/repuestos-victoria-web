'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  PlusIcon,
  FolderIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  slug: string;
  imagen_url: string;
  activa: boolean;
  orden: number;
  productos_count: number;
  subcategorias_count: number;
  creado_en: string;
  actualizado_en: string;
}

interface CategoryFormData {
  nombre: string;
  descripcion: string;
  imagen_url: string;
  activa: boolean;
}

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    nombre: '',
    descripcion: '',
    imagen_url: '',
    activa: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        // Actualizar
        const response = await api.put(`/categories/${editingCategory.id}`, formData);
        if (response.data.success) {
          toast.success('Categoría actualizada exitosamente');
          fetchCategories();
          closeModal();
        }
      } else {
        // Crear
        const response = await api.post('/categories', formData);
        if (response.data.success) {
          toast.success('Categoría creada exitosamente');
          fetchCategories();
          closeModal();
        }
      }
    } catch (error: any) {
      console.error('Error creating/updating category:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Validation errors:', JSON.stringify(error.response?.data?.errors, null, 2));
      const message = error.response?.data?.message || 'Error al guardar categoría';
      toast.error(message);
    }
  };


  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      nombre: '',
      descripcion: '',
      imagen_url: '',
      activa: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) y CSV.');
      return;
    }

    setSelectedFile(file);
    setImportResults(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Tomar la primera hoja
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convertir a JSON con headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 2) {
            toast.error('El archivo debe tener al menos 2 filas (headers + datos)');
            setSelectedFile(null);
            return;
          }

          // Procesar datos
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];

          // Mapear headers (flexible)
          const headerMap: { [key: string]: number } = {};
          headers.forEach((header, index) => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('nombre')) headerMap.nombre = index;
            if (lowerHeader.includes('descripcion')) headerMap.descripcion = index;
            if (lowerHeader.includes('imagen') || lowerHeader.includes('url')) headerMap.imagen_url = index;
            if (lowerHeader.includes('activ')) headerMap.activa = index;
          });

          if (headerMap.nombre === undefined) {
            toast.error('No se encontró columna "nombre" en el archivo');
            setSelectedFile(null);
            return;
          }

          // Convertir filas a objetos categoría
          const categories = rows
            .filter(row => row[headerMap.nombre]) // Filtrar filas vacías
            .map(row => ({
              nombre: String(row[headerMap.nombre] || '').trim(),
              descripcion: headerMap.descripcion !== undefined ? String(row[headerMap.descripcion] || '').trim() : '',
              imagen_url: headerMap.imagen_url !== undefined ? String(row[headerMap.imagen_url] || '').trim() : '',
              activa: headerMap.activa !== undefined ?
                ['true', '1', 'activa', 'si', 'yes'].includes(String(row[headerMap.activa] || '').toLowerCase()) :
                true
            }))
            .filter(cat => cat.nombre.length > 0); // Filtrar nombres vacíos

          if (categories.length === 0) {
            toast.error('No se encontraron categorías válidas en el archivo');
            setSelectedFile(null);
            return;
          }

          setFileData(categories);
          toast.success(`Archivo procesado: ${categories.length} categorías encontradas`);

        } catch (error: any) {
          console.error('Error procesando archivo:', error);
          toast.error('Error al procesar el archivo: ' + error.message);
          setSelectedFile(null);
        }
      };

      reader.readAsArrayBuffer(file);

    } catch (error: any) {
      console.error('Error cargando archivo:', error);
      toast.error('Error al cargar el archivo');
      setSelectedFile(null);
    }

    // Limpiar input
    event.target.value = '';
  };

  const handleImport = async () => {
    if (!fileData || fileData.length === 0) {
      toast.error('No hay datos para importar');
      return;
    }

    setImportLoading(true);

    try {
      // Enviar al backend
      const response = await api.post('/bulk-import/categories', {
        categories: fileData
      });

      if (response.data.success) {
        setImportResults(response.data.results);

        if (response.data.results.created > 0) {
          toast.success(`¡Importación exitosa! ${response.data.results.created} categorías creadas`);
          // Actualizar lista de categorías
          await fetchCategories();
        }

        if (response.data.results.skipped > 0) {
          toast.info(`${response.data.results.skipped} categorías omitidas (ya existían)`);
        }

        if (response.data.results.errors?.length > 0) {
          toast.error(`Se encontraron ${response.data.results.errors.length} errores`);
        }
      }

    } catch (error: any) {
      console.error('Error importando:', error);
      const message = error.response?.data?.message || 'Error al importar categorías';
      toast.error(message);
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['nombre', 'descripcion', 'imagen_url', 'activa'],
      ['Motor', 'Repuestos de motor', 'https://ejemplo.com/motor.jpg', 'true'],
      ['Frenos', 'Sistema de frenado', 'https://ejemplo.com/frenos.jpg', 'true'],
      ['Suspensión', 'Componentes de suspensión', '', 'false']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Categorias');

    XLSX.writeFile(wb, 'plantilla_categorias.xlsx');
  };

  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      active
        ? 'bg-success/10 text-success'
        : 'bg-error/10 text-error'
    }`}>
      {active ? 'Activa' : 'Inactiva'}
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Gestión de Categorías</h1>
            <p className="text-muted">Administra las categorías de productos</p>
          </div>

          {/* Actions Bar */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-primary"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 bg-warning hover:bg-warning/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <DocumentArrowUpIcon className="w-5 h-5" />
                  Importar Categorías
                </button>

                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Nueva Categoría
                </button>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="group cursor-pointer">
                <div
                  onClick={() => window.location.href = `/admin/categories/${category.id}`}
                  className="bg-surface border-2 border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 hover:border-accent/20"
                >
                  {/* Category Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-accent/5 to-accent/10">
                    {category.imagen_url ? (
                      <img
                        src={category.imagen_url}
                        alt={category.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${category.imagen_url ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center`}>
                      <FolderIcon className="w-20 h-20 text-accent/40" />
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {/* Category title and status overlay */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold">{category.nombre}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block bg-accent text-white text-xs px-2 py-1 rounded-full">
                          {category.productos_count} productos
                        </span>
                        <StatusBadge active={category.activa} />
                      </div>
                    </div>
                  </div>

                  {/* Category Content */}
                  <div className="p-4">
                    {category.descripcion && (
                      <p className="text-muted text-sm mb-4 leading-relaxed line-clamp-2">
                        {category.descripcion}
                      </p>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-muted">
                        <span>{category.subcategorias_count} subcategorías</span>
                      </div>
                      <div className="text-accent group-hover:text-accent/80 transition-colors">
                        Ver detalles →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <FolderIcon className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No se encontraron categorías</p>
            </div>
          )}
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4">
                  Importar Categorías desde Excel
                </h2>

                <div className="space-y-6">
                  {!selectedFile && !importResults && (
                    <>
                      {/* Instructions */}
                      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                        <h3 className="font-semibold text-info mb-2">Formato del archivo:</h3>
                        <ul className="text-sm text-muted space-y-1">
                          <li>• Columnas requeridas: <code>nombre</code></li>
                          <li>• Columnas opcionales: <code>descripcion</code>, <code>imagen_url</code>, <code>activa</code></li>
                          <li>• Para <code>activa</code> usar: true/false, 1/0, si/no</li>
                        </ul>
                      </div>

                      {/* File Upload */}
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="excel-upload"
                        />
                        <label
                          htmlFor="excel-upload"
                          className="cursor-pointer"
                        >
                          <DocumentArrowUpIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                          <p className="text-lg font-medium text-primary mb-2">
                            Seleccionar archivo Excel
                          </p>
                          <p className="text-sm text-muted">
                            Formatos soportados: .xlsx, .xls, .csv
                          </p>
                        </label>
                      </div>
                    </>
                  )}

                  {/* File Selected */}
                  {selectedFile && !importResults && (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-success">Archivo seleccionado:</h3>
                          <p className="text-sm text-muted">{selectedFile.name}</p>
                          <p className="text-sm text-muted">{fileData.length} categorías encontradas</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setFileData([]);
                          }}
                          className="text-muted hover:text-error transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Import Button */}
                      <button
                        onClick={handleImport}
                        disabled={importLoading}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                          importLoading
                            ? 'bg-muted cursor-not-allowed'
                            : 'bg-success hover:bg-success/90 text-white'
                        }`}
                      >
                        {importLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Importando...
                          </div>
                        ) : (
                          `Importar ${fileData.length} categorías`
                        )}
                      </button>
                    </div>
                  )}

                  {/* Results */}
                  {importResults && (
                    <div className="space-y-4">
                      {/* Success Summary */}
                      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                        <h3 className="font-semibold text-success mb-3">¡Importación completada!</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-success">{importResults.created}</div>
                            <div className="text-sm text-muted">Creadas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-warning">{importResults.skipped}</div>
                            <div className="text-sm text-muted">Omitidas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-error">{importResults.errors?.length || 0}</div>
                            <div className="text-sm text-muted">Errores</div>
                          </div>
                        </div>
                      </div>

                      {/* Errors Details */}
                      {importResults.errors && importResults.errors.length > 0 && (
                        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                          <h4 className="font-medium text-error mb-2">Detalles de errores:</h4>
                          <ul className="text-sm text-muted space-y-1 max-h-32 overflow-y-auto">
                            {importResults.errors.map((error: string, index: number) => (
                              <li key={index}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-border">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportResults(null);
                      setSelectedFile(null);
                      setFileData([]);
                    }}
                    className="flex-1 bg-muted hover:bg-muted/80 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {importResults ? 'Finalizar' : 'Cancelar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-primary"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      URL de Imagen
                    </label>
                    <input
                      type="url"
                      value={formData.imagen_url}
                      onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-primary"
                    />
                  </div>


                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activa"
                      checked={formData.activa}
                      onChange={(e) => setFormData({...formData, activa: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="activa" className="text-sm text-primary">
                      Categoría activa
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-accent hover:bg-accent/90 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      {editingCategory ? 'Actualizar' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-muted hover:bg-muted/80 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
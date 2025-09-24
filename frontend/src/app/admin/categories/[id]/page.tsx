'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { useParams, useRouter } from 'next/navigation';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  TagIcon,
  DocumentArrowUpIcon,
  DocumentArrowDownIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  slug: string;
  imagen_url: string;
  activa: boolean;
  productos_count: number;
  subcategorias_count: number;
  creado_en: string;
  actualizado_en: string;
}

interface Subcategory {
  id: number;
  id_categoria: number;
  nombre: string;
  descripcion: string;
  slug: string;
  icono: string;
  activa: boolean;
  productos_count: number;
  creado_en: string;
  actualizado_en: string;
  categoria_nombre: string;
}

interface SubcategoryFormData {
  nombre: string;
  descripcion: string;
  activa: boolean;
}

export default function AdminCategoryDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState<SubcategoryFormData>({
    nombre: '',
    descripcion: '',
    activa: true
  });
  const [categoryFormData, setCategoryFormData] = useState({
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
    if (categoryId) {
      fetchCategoryDetails();
      fetchSubcategories();
    }
  }, [categoryId]);

  const fetchCategoryDetails = async () => {
    try {
      const response = await api.get(`/categories/${categoryId}`);
      if (response.data.success) {
        setCategory(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching category:', error);
      toast.error('Error al cargar categoría');
      router.push('/admin/categories');
    }
  };

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/subcategories?categoryId=${categoryId}`);
      if (response.data.success) {
        setSubcategories(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching subcategories:', error);
      toast.error('Error al cargar subcategorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        id_categoria: parseInt(categoryId)
      };

      if (editingSubcategory) {
        // Actualizar
        const response = await api.put(`/subcategories/${editingSubcategory.id}`, dataToSend);
        if (response.data.success) {
          toast.success('Subcategoría actualizada exitosamente');
          fetchSubcategories();
          closeModal();
        }
      } else {
        // Crear
        const response = await api.post('/subcategories', dataToSend);
        if (response.data.success) {
          toast.success('Subcategoría creada exitosamente');
          fetchSubcategories();
          closeModal();
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al guardar subcategoría';
      toast.error(message);
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      nombre: subcategory.nombre,
      descripcion: subcategory.descripcion || '',
      activa: subcategory.activa
    });
    setShowModal(true);
  };

  const handleDelete = async (subcategory: Subcategory) => {
    if (subcategory.productos_count > 0) {
      toast.error('No se puede eliminar la subcategoría porque tiene productos asociados');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar la subcategoría "${subcategory.nombre}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/subcategories/${subcategory.id}`);
      if (response.data.success) {
        toast.success('Subcategoría eliminada exitosamente');
        fetchSubcategories();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al eliminar subcategoría';
      toast.error(message);
    }
  };

  const handleToggleStatus = async (subcategory: Subcategory) => {
    try {
      const response = await api.patch(`/subcategories/${subcategory.id}/toggle-status`);
      if (response.data.success) {
        toast.success(`Subcategoría ${subcategory.activa ? 'desactivada' : 'activada'} exitosamente`);
        fetchSubcategories();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cambiar estado de subcategoría';
      toast.error(message);
    }
  };

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setFormData({
      nombre: '',
      descripcion: '',
      activa: true
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubcategory(null);
  };

  const handleCategoryEdit = () => {
    if (category) {
      setCategoryFormData({
        nombre: category.nombre,
        descripcion: category.descripcion || '',
        imagen_url: category.imagen_url || '',
        activa: category.activa
      });
      setShowCategoryEditModal(true);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put(`/categories/${categoryId}`, categoryFormData);
      if (response.data.success) {
        toast.success('Categoría actualizada exitosamente');
        fetchCategoryDetails();
        setShowCategoryEditModal(false);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar categoría';
      toast.error(message);
    }
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
            if (lowerHeader.includes('categoria')) headerMap.categoria = index;
            if (lowerHeader.includes('nombre') && !lowerHeader.includes('categoria')) headerMap.nombre = index;
            if (lowerHeader.includes('descripcion')) headerMap.descripcion = index;
            if (lowerHeader.includes('activ')) headerMap.activa = index;
          });

          if (headerMap.categoria === undefined) {
            toast.error('No se encontró columna "categoria" en el archivo');
            setSelectedFile(null);
            return;
          }

          if (headerMap.nombre === undefined) {
            toast.error('No se encontró columna "nombre" en el archivo');
            setSelectedFile(null);
            return;
          }

          // Convertir filas a objetos subcategoría
          const subcategories = rows
            .filter(row => row[headerMap.categoria] && row[headerMap.nombre]) // Filtrar filas vacías
            .map(row => ({
              categoria: String(row[headerMap.categoria] || '').trim(),
              nombre: String(row[headerMap.nombre] || '').trim(),
              descripcion: headerMap.descripcion !== undefined ? String(row[headerMap.descripcion] || '').trim() : '',
              activa: headerMap.activa !== undefined ?
                ['true', '1', 'activa', 'si', 'yes'].includes(String(row[headerMap.activa] || '').toLowerCase()) :
                true
            }))
            .filter(sub => sub.categoria.length > 0 && sub.nombre.length > 0); // Filtrar datos vacíos

          if (subcategories.length === 0) {
            toast.error('No se encontraron subcategorías válidas en el archivo');
            setSelectedFile(null);
            return;
          }

          setFileData(subcategories);
          toast.success(`Archivo procesado: ${subcategories.length} subcategorías encontradas`);

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
      const response = await api.post('/bulk-import/subcategories', {
        subcategories: fileData
      });

      if (response.data.success) {
        setImportResults(response.data.results);

        if (response.data.results.created > 0) {
          toast.success(`¡Importación exitosa! ${response.data.results.created} subcategorías creadas`);
          // Actualizar lista de subcategorías
          await fetchSubcategories();
        }

        if (response.data.results.skipped > 0) {
          toast.info(`${response.data.results.skipped} subcategorías omitidas (ya existían)`);
        }

        if (response.data.results.errors?.length > 0) {
          toast.error(`Se encontraron ${response.data.results.errors.length} errores`);
        }
      }

    } catch (error: any) {
      console.error('Error importando:', error);
      const message = error.response?.data?.message || 'Error al importar subcategorías';
      toast.error(message);
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['categoria', 'nombre', 'descripcion', 'activa'],
      [category?.nombre || 'Motor', 'Pistones', 'Pistones para motor', 'true'],
      [category?.nombre || 'Motor', 'Válvulas', 'Válvulas de admisión y escape', 'true'],
      [category?.nombre || 'Motor', 'Juntas', 'Juntas y empaques', 'false']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subcategorias');

    XLSX.writeFile(wb, `plantilla_subcategorias_${category?.nombre || 'categoria'}.xlsx`);
  };

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategory.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="mt-4 text-muted">Cargando subcategorías...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/admin/categories')}
            className="flex items-center gap-2 text-white hover:text-white/80 mb-6 transition-colors bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver a Categorías
          </button>

          {/* Category Header */}
          {category && (
            <div className="bg-surface rounded-xl shadow-sm overflow-hidden mb-8">
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-r from-accent to-accent/80">
                {category.imagen_url ? (
                  <img
                    src={category.imagen_url}
                    alt={category.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent via-accent/90 to-accent/70 flex items-center justify-center">
                    <FolderIcon className="w-24 h-24 text-white/40" />
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Edit button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleCategoryEdit}
                    className="bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>

              {/* Category Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-primary">{category.nombre}</h1>
                    <StatusBadge active={category.activa} />
                  </div>
                </div>

                {category.descripcion && (
                  <p className="text-muted text-lg mb-4 leading-relaxed">
                    {category.descripcion}
                  </p>
                )}

                <div className="flex items-center gap-8 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">{category.productos_count}</span>
                    <span>productos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">{filteredSubcategories.length}</span>
                    <span>subcategorías</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Creada el {new Date(category.creado_en).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Subcategorías</h2>
            <p className="text-muted">Administra las subcategorías de esta categoría</p>
          </div>

          {/* Actions Bar */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar subcategorías..."
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
                  Importar Subcategorías
                </button>

                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Nueva Subcategoría
                </button>
              </div>
            </div>
          </div>

          {/* Subcategories List */}
          <div className="space-y-4">
            {filteredSubcategories.map((subcategory) => (
              <div key={subcategory.id} className="bg-surface border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <TagIcon className="w-10 h-10 text-accent" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-primary">{subcategory.nombre}</h3>
                        <StatusBadge active={subcategory.activa} />
                      </div>

                      {subcategory.descripcion && (
                        <p className="text-muted mb-3 leading-relaxed">
                          {subcategory.descripcion}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-muted">
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{subcategory.productos_count}</span>
                          productos
                        </span>
                        <span>•</span>
                        <span>Creada el {new Date(subcategory.creado_en).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(subcategory)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-info/10 text-info hover:bg-info/20 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Editar
                    </button>

                    <button
                      onClick={() => handleToggleStatus(subcategory)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-warning/10 text-warning hover:bg-warning/20 rounded-lg transition-colors"
                    >
                      {subcategory.activa ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      {subcategory.activa ? 'Desactivar' : 'Activar'}
                    </button>

                    <button
                      onClick={() => handleDelete(subcategory)}
                      disabled={subcategory.productos_count > 0}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                        subcategory.productos_count > 0
                          ? 'bg-muted/10 text-muted cursor-not-allowed'
                          : 'bg-error/10 text-error hover:bg-error/20'
                      }`}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSubcategories.length === 0 && (
            <div className="text-center py-12">
              <TagIcon className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">No se encontraron subcategorías</p>
            </div>
          )}
        </div>

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4">
                  Importar Subcategorías desde Excel
                </h2>

                <div className="space-y-6">
                  {!selectedFile && !importResults && (
                    <>
                      {/* Instructions */}
                      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                        <h3 className="font-semibold text-info mb-2">Formato del archivo:</h3>
                        <ul className="text-sm text-muted space-y-1">
                          <li>• Columnas requeridas: <code>categoria</code>, <code>nombre</code></li>
                          <li>• Columnas opcionales: <code>descripcion</code>, <code>activa</code></li>
                          <li>• Para <code>activa</code> usar: true/false, 1/0, si/no</li>
                        </ul>
                      </div>

                      {/* Current Category Info */}
                      {category && (
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                          <h3 className="font-semibold text-accent mb-2">Tip:</h3>
                          <p className="text-sm text-muted">
                            Puedes importar subcategorías para cualquier categoría.
                            Categoría actual: <strong>{category.nombre}</strong>
                          </p>
                        </div>
                      )}

                      {/* File Upload */}
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="excel-upload-sub"
                        />
                        <label
                          htmlFor="excel-upload-sub"
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
                          <p className="text-sm text-muted">{fileData.length} subcategorías encontradas</p>
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
                          `Importar ${fileData.length} subcategorías`
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
                  {editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
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


                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activa"
                      checked={formData.activa}
                      onChange={(e) => setFormData({...formData, activa: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="activa" className="text-sm text-primary">
                      Subcategoría activa
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-accent hover:bg-accent/90 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      {editingSubcategory ? 'Actualizar' : 'Crear'}
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

        {/* Category Edit Modal */}
        {showCategoryEditModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-primary mb-4">
                  Editar Categoría
                </h2>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.nombre}
                      onChange={(e) => setCategoryFormData({...categoryFormData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={categoryFormData.descripcion}
                      onChange={(e) => setCategoryFormData({...categoryFormData, descripcion: e.target.value})}
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
                      value={categoryFormData.imagen_url}
                      onChange={(e) => setCategoryFormData({...categoryFormData, imagen_url: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-background text-primary"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="categoriaActiva"
                      checked={categoryFormData.activa}
                      onChange={(e) => setCategoryFormData({...categoryFormData, activa: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="categoriaActiva" className="text-sm text-primary">
                      Categoría activa
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-accent hover:bg-accent/90 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Actualizar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryEditModal(false)}
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
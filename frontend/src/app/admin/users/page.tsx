'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  correo: string;
  nombres: string;
  a_paterno: string;
  a_materno: string;
  activo: boolean;
  verificado: boolean;
  creado_en: string;
  ultimo_ingreso: string;
  nombre_rol: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState<any[]>([]);

  const fetchUsers = async (page = 1, searchTerm = '', role = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(role && { role })
      });

      const response = await api.get(`/users/users?${params}`);
      
      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/users/roles');
      if (response.data.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleSearch = () => {
    fetchUsers(1, search, selectedRole);
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await api.put(`/users/users/${userId}`, {
        activo: !currentStatus
      });

      if (response.data.success) {
        toast.success(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
        fetchUsers(pagination.page, search, selectedRole);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error actualizando usuario');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await api.delete(`/users/users/${userId}`);

      if (response.data.success) {
        toast.success('Usuario eliminado exitosamente');
        fetchUsers(pagination.page, search, selectedRole);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error eliminando usuario');
    }
  };

  const StatusBadge = ({ status, type }: { status: boolean; type: 'active' | 'verified' }) => {
    const config = {
      active: {
        true: { bg: 'bg-success/10', text: 'text-success', label: 'Activo' },
        false: { bg: 'bg-error/10', text: 'text-error', label: 'Inactivo' }
      },
      verified: {
        true: { bg: 'bg-info/10', text: 'text-info', label: 'Verificado' },
        false: { bg: 'bg-warning/10', text: 'text-warning', label: 'Sin verificar' }
      }
    };

    const style = config[type][status.toString() as 'true' | 'false'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Gestión de Usuarios</h1>
            <p className="text-muted">Administra usuarios del sistema</p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium mb-2">
                  Buscar usuarios
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full input input-bordered bg-surface-secondary pl-10"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                </div>
              </div>

              <div className="md:w-48">
                <label htmlFor="role" className="block text-sm font-medium mb-2">
                  Filtrar por rol
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full select select-bordered bg-surface-secondary"
                >
                  <option value="">Todos los roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.nombre}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  className="btn bg-accent text-white hover:brightness-110"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-muted">Cargando usuarios...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-surface-secondary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                          Registro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-surface-secondary">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-primary">
                                {user.nombres} {user.a_paterno} {user.a_materno}
                              </div>
                              <div className="text-sm text-muted">ID: {user.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary">{user.correo}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                              {user.nombre_rol}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <StatusBadge status={user.activo} type="active" />
                              <StatusBadge status={user.verificado} type="verified" />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                            <div>
                              <div>{new Date(user.creado_en).toLocaleDateString()}</div>
                              {user.ultimo_ingreso && (
                                <div className="text-xs">
                                  Último: {new Date(user.ultimo_ingreso).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleActive(user.id, user.activo)}
                                className={`p-2 rounded-md transition-colors ${
                                  user.activo
                                    ? 'text-error hover:bg-error/10'
                                    : 'text-success hover:bg-success/10'
                                }`}
                                title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                              >
                                {user.activo ? (
                                  <XCircleIcon className="h-4 w-4" />
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4" />
                                )}
                              </button>

                              <button
                                onClick={() => window.open(`/admin/users/${user.id}`, '_blank')}
                                className="p-2 rounded-md text-info hover:bg-info/10 transition-colors"
                                title="Ver detalles"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteUser(user.id, `${user.nombres} ${user.a_paterno}`)}
                                className="p-2 rounded-md text-error hover:bg-error/10 transition-colors"
                                title="Eliminar usuario"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fetchUsers(pagination.page - 1, search, selectedRole)}
                          disabled={pagination.page === 1}
                          className="btn btn-sm disabled:opacity-50"
                        >
                          Anterior
                        </button>
                        
                        <span className="text-sm text-muted">
                          Página {pagination.page} de {pagination.pages}
                        </span>
                        
                        <button
                          onClick={() => fetchUsers(pagination.page + 1, search, selectedRole)}
                          disabled={pagination.page === pagination.pages}
                          className="btn btn-sm disabled:opacity-50"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
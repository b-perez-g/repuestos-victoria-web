'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/auth/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UserIcon, KeyIcon, ClockIcon } from '@heroicons/react/24/outline';

const profileSchema = yup.object().shape({
  nombres: yup
    .string()
    .required('Los nombres son obligatorios')
    .min(2, 'Los nombres deben tener al menos 2 caracteres')
    .max(100, 'Los nombres no pueden tener más de 100 caracteres'),
  a_paterno: yup
    .string()
    .required('El apellido paterno es obligatorio')
    .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
    .max(100, 'El apellido paterno no puede tener más de 100 caracteres'),
  a_materno: yup
    .string()
    .max(100, 'El apellido materno no puede tener más de 100 caracteres')
    .optional()
});

const passwordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('La contraseña actual es obligatoria'),
  newPassword: yup
    .string()
    .required('La nueva contraseña es obligatoria')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
      'La contraseña debe tener al menos 8 caracteres, incluyendo: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'
    ),
  confirmPassword: yup
    .string()
    .required('Confirma tu nueva contraseña')
    .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden')
});

type ProfileFormData = {
  nombres: string;
  a_paterno: string;
  a_materno?: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface UserProfile {
  id: number;
  correo: string;
  nombres: string;
  a_paterno: string;
  a_materno?: string;
  activo: boolean;
  verificado: boolean;
  creado_en: string;
  ultimo_ingreso?: string;
  rol: string;
}

interface UserActivity {
  activeSessions: number;
  recentLogins: Array<{
    creado_en: string;
    ip: string;
    agente_usuario: string;
  }>;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    reset: resetProfile
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema) as any
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema) as any
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileRes, activityRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/users/activity')
        ]);

        if (profileRes.data.success) {
          const profile = profileRes.data.user;
          setUserProfile(profile);
          resetProfile({
            nombres: profile.nombres || '',
            a_paterno: profile.a_paterno || '',
            a_materno: profile.a_materno || ''
          });
        }

        if (activityRes.data.success) {
          setActivity(activityRes.data.activity);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Error cargando datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [resetProfile]);

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      const profileData = {
        nombres: data.nombres,
        a_paterno: data.a_paterno,
        a_materno: data.a_materno || null
      };

      const response = await api.put('/users/profile', profileData);
      
      if (response.data.success) {
        toast.success('Perfil actualizado exitosamente');
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            nombres: data.nombres,
            a_paterno: data.a_paterno,
            a_materno: data.a_materno
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error actualizando perfil');
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      const response = await api.post('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      if (response.data.success) {
        toast.success('Contraseña actualizada exitosamente');
        resetPassword();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error actualizando contraseña');
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-accent text-white'
          : 'bg-surface-secondary text-muted hover:bg-surface hover:text-primary'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted">Cargando perfil...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Mi Perfil</h1>
            <p className="text-muted">Gestiona tu información personal y configuración</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <TabButton id="profile" label="Información Personal" icon={UserIcon} />
            <TabButton id="password" label="Cambiar Contraseña" icon={KeyIcon} />
            <TabButton id="activity" label="Actividad" icon={ClockIcon} />
          </div>

          {/* Content */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-6">Información Personal</h2>
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nombres" className="block mb-1 text-sm font-medium">
                        Nombres
                      </label>
                      <input
                        id="nombres"
                        type="text"
                        {...registerProfile('nombres')}
                        className={`w-full input input-bordered bg-surface-secondary border ${
                          profileErrors.nombres ? 'border-error' : 'border-border'
                        }`}
                        disabled={isSubmittingProfile}
                      />
                      {profileErrors.nombres && (
                        <p className="mt-1 text-sm text-error">{profileErrors.nombres.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="a_paterno" className="block mb-1 text-sm font-medium">
                        Apellido Paterno
                      </label>
                      <input
                        id="a_paterno"
                        type="text"
                        {...registerProfile('a_paterno')}
                        className={`w-full input input-bordered bg-surface-secondary border ${
                          profileErrors.a_paterno ? 'border-error' : 'border-border'
                        }`}
                        disabled={isSubmittingProfile}
                      />
                      {profileErrors.a_paterno && (
                        <p className="mt-1 text-sm text-error">{profileErrors.a_paterno.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="a_materno" className="block mb-1 text-sm font-medium">
                      Apellido Materno <span className="text-muted text-xs">(opcional)</span>
                    </label>
                    <input
                      id="a_materno"
                      type="text"
                      {...registerProfile('a_materno')}
                      className={`w-full input input-bordered bg-surface-secondary border ${
                        profileErrors.a_materno ? 'border-error' : 'border-border'
                      }`}
                      disabled={isSubmittingProfile}
                    />
                    {profileErrors.a_materno && (
                      <p className="mt-1 text-sm text-error">{profileErrors.a_materno.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={userProfile?.correo || ''}
                      className="w-full input input-bordered bg-surface-secondary border-border opacity-50"
                      disabled
                    />
                    <p className="mt-1 text-xs text-muted">
                      El correo electrónico no se puede modificar
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingProfile}
                    className="btn bg-accent text-white hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmittingProfile ? 'Actualizando...' : 'Actualizar Perfil'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-6">Cambiar Contraseña</h2>
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="currentPassword" className="block mb-1 text-sm font-medium">
                      Contraseña Actual
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      {...registerPassword('currentPassword')}
                      className={`w-full input input-bordered bg-surface-secondary border ${
                        passwordErrors.currentPassword ? 'border-error' : 'border-border'
                      }`}
                      disabled={isSubmittingPassword}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-error">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block mb-1 text-sm font-medium">
                      Nueva Contraseña
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      {...registerPassword('newPassword')}
                      className={`w-full input input-bordered bg-surface-secondary border ${
                        passwordErrors.newPassword ? 'border-error' : 'border-border'
                      }`}
                      disabled={isSubmittingPassword}
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-error">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      {...registerPassword('confirmPassword')}
                      className={`w-full input input-bordered bg-surface-secondary border ${
                        passwordErrors.confirmPassword ? 'border-error' : 'border-border'
                      }`}
                      disabled={isSubmittingPassword}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-error">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="btn bg-accent text-white hover:brightness-110 disabled:opacity-50"
                  >
                    {isSubmittingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-semibold text-primary mb-6">Actividad de la Cuenta</h2>
                
                {/* Información de la cuenta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-surface-secondary rounded-lg p-4">
                    <h3 className="font-medium text-primary mb-2">Estado de la Cuenta</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Email verificado:</span>
                        <span className={userProfile?.verificado ? 'text-success' : 'text-error'}>
                          {userProfile?.verificado ? 'Sí' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Cuenta activa:</span>
                        <span className={userProfile?.activo ? 'text-success' : 'text-error'}>
                          {userProfile?.activo ? 'Sí' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Rol:</span>
                        <span className="text-primary capitalize">{userProfile?.rol || 'cliente'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Miembro desde:</span>
                        <span className="text-primary">
                          {userProfile?.creado_en ? 
                            new Date(userProfile.creado_en).toLocaleDateString() : 
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-secondary rounded-lg p-4">
                    <h3 className="font-medium text-primary mb-2">Actividad Reciente</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Último ingreso:</span>
                        <span className="text-primary">
                          {userProfile?.ultimo_ingreso ? 
                            new Date(userProfile.ultimo_ingreso).toLocaleString() : 
                            'Nunca'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Sesiones activas:</span>
                        <span className="text-primary">{activity?.activeSessions || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historial de logins */}
                {activity?.recentLogins && activity.recentLogins.length > 0 && (
                  <div>
                    <h3 className="font-medium text-primary mb-4">Inicios de Sesión Recientes</h3>
                    <div className="space-y-2">
                      {activity.recentLogins.map((login, index: number) => (
                        <div key={index} className="bg-surface-secondary rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-primary">
                                {new Date(login.creado_en).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted">IP: {login.ip}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted max-w-48 truncate" title={login.agente_usuario}>
                                {login.agente_usuario}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
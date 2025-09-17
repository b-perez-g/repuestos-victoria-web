// Ejemplo de uso en un componente
import { useAuth } from '@/contexts/auth/useAuth';

const MiComponente = () => {
  const { user, login, logout } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <p>Bienvenido, {user.name}!</p>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      ) : (
        <div>
          <button onClick={() => login('usuario@ejemplo.com', 'contraseña')}>Iniciar sesión</button>
        </div>
      )}
    </div>
  );
};

export default MiComponente;

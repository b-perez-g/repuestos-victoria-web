import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface RegisterData {
  correo: string;
  contrasena: string;
  nombres: string;
  a_paterno: string;
  a_materno?: string | null;
  id_rol?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (correo: string, contrasena: string, recordar?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
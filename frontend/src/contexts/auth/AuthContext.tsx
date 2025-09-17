// src/contexts/auth/AuthContext.tsx
import { createContext } from 'react';

export type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
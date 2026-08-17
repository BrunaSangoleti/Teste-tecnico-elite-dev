import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types';
import { api } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextData {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Ao iniciar o app, checa se já existe um token salvo
    const token = localStorage.getItem('@ingresso:token');
    if (token) {
      try {
        const decoded = jwtDecode<{ sub: string, role: string, userId: string, name?: string }>(token);
        setUser({ id: decoded.userId || 'id-temporario', name: decoded.name, email: decoded.sub, role: decoded.role as any });
      } catch (error) {
        logout();
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('@ingresso:token', token);
    const decoded = jwtDecode<{ sub: string, role: string, userId: string, name?: string }>(token);
    setUser({ id: decoded.userId || 'id-temporario', name: decoded.name, email: decoded.sub, role: decoded.role as any });
  };

  const logout = () => {
    localStorage.removeItem('@ingresso:token');
    setUser(null);
    window.location.href = '/login'; // Força redirecionamento seguro
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

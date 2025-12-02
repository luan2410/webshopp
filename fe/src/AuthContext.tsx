import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken, setToken as saveToken } from './api';

interface AuthContextType {
  user: any | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      // Decode simple JWT payload to get info if needed, or just trust token presence for now
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.sub });
        setRole(payload.role);
        setIsAuthenticated(true);
      } catch (e) {
        logout();
      }
    }
  }, []);

  const login = (token: string, role: string) => {
    saveToken(token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ username: payload.sub });
      setRole(role);
      setIsAuthenticated(true);
    } catch {}
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 本番環境では必ずこのパスワードを変更してください
const ADMIN_PASSWORD = 'admin';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (password: string) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminSession', 'true');
      setIsAuthenticated(true);
    } else {
      throw new Error('Invalid password');
    }
  };

  const logout = async () => {
    localStorage.removeItem('adminSession');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
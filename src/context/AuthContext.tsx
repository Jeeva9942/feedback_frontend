import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { apiFetch } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: { rollNo?: string; username?: string; password?: string; role: 'student' | 'admin' }) => Promise<string | null>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage (no local admin data)
    const saved = localStorage.getItem('npc_current_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { rollNo?: string; username?: string; password?: string; role: 'student' | 'admin' }): Promise<string | null> => {
    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return data.error || 'Login failed';
      }

      const u: User = data.user;
      setUser(u);
      localStorage.setItem('npc_current_user', JSON.stringify(u));
      return null;
    } catch (err: any) {
      console.error('Login error:', err);
      return 'Connection error. Please try again.';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('npc_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

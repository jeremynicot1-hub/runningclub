'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, getToken, setToken, removeToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'COACH' | 'ATHLETE';
  firstName: string;
  lastName: string;
  clubId?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'COACH' | 'ATHLETE';
  sport?: string;
  license?: string;
  dob?: string;
  height?: number;
  weight?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const u = await apiFetch<User>('/api/users/me');
        if (isMounted) setUser(u);
      } catch {
        removeToken();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (formData: RegisterData) => {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

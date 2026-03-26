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
  clubs?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

  const fetchUser = async (isMounted = true) => {
    const token = getToken();
    if (!token) {
      if (isMounted) setLoading(false);
      return;
    }
    try {
      const u = await apiFetch<User>('/api/users/me');
      if (isMounted) setUser(u);
    } catch (err: any) {
      console.error('Session error:', err.message);
      removeToken();
      if (isMounted) setUser(null);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchUser(isMounted);
    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    // Explicitly re-fetch to get clubs and full profile
    await fetchUser();
  };

  const register = async (formData: RegisterData) => {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    setToken(data.token);
    await fetchUser();
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

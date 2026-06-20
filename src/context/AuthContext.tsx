import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AUTH, setToken, clearToken } from '../lib/api';
import type { User } from '../types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, dob: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const t = localStorage.getItem('gam_token');
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await AUTH.me();
      setUser(user);
    } catch {
      clearToken();
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await AUTH.login(email, password);
    setToken(token);
    setUser(user);
  };

  const signup = async (email: string, password: string, fullName: string, dob: string) => {
    const { token, user } = await AUTH.signup(email, password, fullName, dob);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, signup, logout, refresh }}>{children}</Ctx.Provider>;
}

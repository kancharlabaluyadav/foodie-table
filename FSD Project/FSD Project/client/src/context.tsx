import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './api';
import type { CartItems, User } from './types';

interface CartContextValue {
  items: CartItems;
  count: number;
  addItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<string>;
  adminLogin: (username: string, password: string) => Promise<string>;
  register: (name: string, email: string, phone: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);
const AuthContext = createContext<AuthContextValue | null>(null);
const CART_KEY = 'juniper-table-cart';

function readStoredCart(): CartItems {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const cart: CartItems = {};
    Object.entries(value).forEach(([id, rawQuantity]) => {
      const quantity = Number(rawQuantity);
      if (/^[a-z0-9-]+$/.test(id) && Number.isInteger(quantity) && quantity >= 1 && quantity <= 10) cart[id] = quantity;
    });
    return cart;
  } catch {
    return {};
  }
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItems>(readStoredCart);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* Storage can be disabled by the browser. */ }
  }, [items]);

  const addItem = useCallback((id: string) => {
    setItems((current) => {
      if ((current[id] || 0) >= 10) return current;
      return { ...current, [id]: (current[id] || 0) + 1 };
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return;
    setItems((current) => ({ ...current, [id]: quantity }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await api<{ user: User | null }>('/auth/me');
      setUser(result.user);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api<{ message: string; user: User }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    setUser(result.user);
    return result.message;
  }, []);

  const adminLogin = useCallback(async (username: string, password: string) => {
    const result = await api<{ message: string; user: User }>('/auth/admin-login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    });
    setUser(result.user);
    return result.message;
  }, []);

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const result = await api<{ message: string; user: User }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ name, email, phone, password }),
    });
    setUser(result.user);
    return result.message;
  }, []);

  const logout = useCallback(async () => {
    await api<{ message: string }>('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const count = useMemo(() => Object.values(items).reduce((sum, quantity) => sum + quantity, 0), [items]);
  const cartValue = useMemo<CartContextValue>(() => ({
    items, count, addItem, setQuantity, removeItem, clear: () => setItems({}),
  }), [items, count, addItem, setQuantity, removeItem]);
  const authValue = useMemo<AuthContextValue>(() => ({ user, ready, refresh, login, adminLogin, register, logout }), [user, ready, refresh, login, adminLogin, register, logout]);

  return <AuthContext.Provider value={authValue}><CartContext.Provider value={cartValue}>{children}</CartContext.Provider></AuthContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside AppProviders.');
  return value;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AppProviders.');
  return value;
}

import { createContext, useContext, useState, useCallback } from 'react';
import { SESSION_KEY } from '../api/axiosClient';

const AuthContext = createContext(null);
const STORAGE_KEY = SESSION_KEY;

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user ? parsed : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());

  const login = useCallback((payload) => {
    const nextSession = {
      token: payload.token || '',
      user: {
        id: payload.user?.id || payload.id,
        name: payload.user?.name || payload.name,
        email: payload.user?.email || payload.email,
        role: payload.user?.role || payload.role, // 'landlord' | 'tenant'
        roomId: payload.user?.roomId ?? payload.roomId ?? null,
      },
    };
    setSession(nextSession);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    user: session?.user || null,
    token: session?.token || null,
    isAuthenticated: Boolean(session?.user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, SiteSettings } from '../types';
import { fetchApi, setToken, getToken } from '../lib/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: UserProfile | null;
  settings: SiteSettings | null;
  isLoading: boolean;
  isAdmin: boolean;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (payload: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light') return false;
      if (saved === 'dark') return true;
    }
    return true; // Default to dark mode for Earnora
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await fetchApi<SiteSettings>('/settings');
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetchApi<{ user: UserProfile; settings: SiteSettings }>('/auth/me');
      setUser(res.user);
      if (res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
    refreshUser();
  }, [refreshSettings, refreshUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fpb_logged_out');
      }
      const res = await fetchApi<{ token: string; user: UserProfile; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      setUser(res.user);
      showToast(res.message || 'লগইন সফল হয়েছে!', 'success');
      await refreshSettings();
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fpb_logged_out');
      }
      const res = await fetchApi<{ token: string; admin: any; message: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      showToast(res.message || 'অ্যাডমিন লগইন সফল হয়েছে!', 'success');
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
    referralCode?: string;
  }) => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('fpb_logged_out');
      }
      const res = await fetchApi<{ token: string; user: UserProfile; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setToken(res.token);
      setUser(res.user);
      showToast(res.message || 'রেজিস্ট্রেশন সফল হয়েছে!', 'success');
      await refreshSettings();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('fpb_logged_out', 'true');
      }
      setToken(null);
      setUser(null);
      showToast('লগআউট সফল হয়েছে', 'info');
    }
  };

  const isAdmin = Boolean(
    user &&
      (user.role === 'admin' ||
        (user.roles && user.roles.includes('admin')) ||
        user.isSuperAdmin)
  );

  return (
    <AppContext.Provider
      value={{
        user,
        settings,
        isLoading,
        isAdmin,
        toasts,
        showToast,
        removeToast,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
        refreshSettings,
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

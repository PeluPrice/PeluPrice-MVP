'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { login, logout, getCurrentUser, isAuthenticated } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde authentication durumunu kontrol et
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          const response = await getCurrentUser();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Geçersiz token'ları temizle
        await logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Storage değişikliklerini dinle (diğer tab'lardan gelen değişiklikler)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authTokens' && e.storageArea === localStorage) {
        if (!e.newValue && user) {
          // Token silinmiş, kullanıcıyı çıkış yap
          setUser(null);
        } else if (e.newValue && !user) {
          // Yeni token var ama kullanıcı yok, yeniden kontrol et
          getCurrentUser()
            .then(response => setUser(response.data))
            .catch(() => setUser(null));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  // Visibility change ve focus event'lerini dinle
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Sayfa görünür olduğunda authentication durumunu kontrol et
        if (isAuthenticated() && !user) {
          try {
            const response = await getCurrentUser();
            setUser(response.data);
          } catch (error) {
            console.error('Visibility auth check failed:', error);
            await logout();
            setUser(null);
          }
        } else if (!isAuthenticated() && user) {
          // Token yoksa kullanıcıyı temizle
          setUser(null);
        }
      }
    };

    const handleFocus = () => {
      handleVisibilityChange();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const loginUser = async (credentials) => {
    setLoading(true);
    try {
      const response = await login(credentials);
      setUser(response.data.user);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const value = {
    user,
    loading,
    login: loginUser,
    logout: logoutUser,
    updateUser,
    isAuthenticated: !!user && !loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

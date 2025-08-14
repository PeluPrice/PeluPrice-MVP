'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isAuthenticated, getCurrentUser } from '../lib/api';

export const useAuthPersistence = () => {
  const { user, login, logout } = useAuth();

  useEffect(() => {
    const checkAuthOnFocus = async () => {
      // Sayfa focus'a geldiğinde oturum durumunu kontrol et
      if (!user && isAuthenticated()) {
        try {
          const response = await getCurrentUser();
          // AuthContext'teki user state'ini güncelle
          // Bu biraz hacky ama gerekli
          window.location.reload();
        } catch (error) {
          console.error('Auth persistence check failed:', error);
          await logout();
        }
      }
    };

    const handleFocus = () => {
      checkAuthOnFocus();
    };

    const handleStorage = (e) => {
      // localStorage değişikliklerini dinle
      if (e.key === 'authTokens' || e.key === 'rememberMe') {
        if (!e.newValue && user) {
          // Token silinmişse kullanıcıyı çıkış yap
          logout();
        } else if (e.newValue && !user) {
          // Token eklenmiş ama kullanıcı yoksa yeniden yükle
          checkAuthOnFocus();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user, logout]);

  return { user };
};

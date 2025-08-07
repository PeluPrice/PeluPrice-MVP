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

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const response = await getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid tokens
          await logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const loginUser = async (credentials) => {
    const response = await login(credentials);
    setUser(response.data.user);
    return response;
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login: loginUser,
    logout: logoutUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

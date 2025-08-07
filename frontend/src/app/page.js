'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="relative">
            {/* Animated background circles */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full animate-ping opacity-30"></div>
            <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full animate-ping opacity-40 animation-delay-100"></div>
            
            {/* Main spinner */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-2 border-purple-600 dark:border-purple-400 border-r-transparent rounded-full animate-spin animate-reverse"></div>
              
              {/* Center emoji */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl animate-bounce">🧸</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            PlushCryptoAlarm
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">
            Yükleniyor...
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-sm">
            Crypto dünyasına hoş geldiniz
          </p>
          
          {/* Loading dots */}
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse animation-delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

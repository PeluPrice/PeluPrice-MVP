'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../i18n';
import { Navbar } from '../../../components/Navbar';
import { PortfolioSummary } from '../../../components/PortfolioSummary';
import { PortfolioCard } from '../../../components/PortfolioCard';
import { AddCoinForm } from '../../../components/AddCoinForm';

export default function PortfolioPage() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCoinForm, setShowAddCoinForm] = useState(false);

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Auth loading bitene kadar bekle
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Portfolio coins'i local storage'dan yükle
    const loadPortfolioCoins = () => {
      try {
        const savedCoins = localStorage.getItem('portfolioCoins');
        if (savedCoins) {
          setCoins(JSON.parse(savedCoins));
        }
      } catch (err) {
        console.error('Portfolio loading error:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioCoins();
  }, [authLoading, isAuthenticated, router, t]);

  const addCoin = (newCoin) => {
    const updatedCoins = [...coins, { ...newCoin, id: Date.now() }];
    setCoins(updatedCoins);
    localStorage.setItem('portfolioCoins', JSON.stringify(updatedCoins));
    setShowAddCoinForm(false);
  };

  const updateCoin = (coinId, updatedCoin) => {
    const updatedCoins = coins.map(coin => 
      coin.id === coinId ? { ...coin, ...updatedCoin } : coin
    );
    setCoins(updatedCoins);
    localStorage.setItem('portfolioCoins', JSON.stringify(updatedCoins));
  };

  const deleteCoin = (coinId) => {
    const updatedCoins = coins.filter(coin => coin.id !== coinId);
    setCoins(updatedCoins);
    localStorage.setItem('portfolioCoins', JSON.stringify(updatedCoins));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 absolute top-0"></div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-300 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      
      <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {t('portfolio.portfolioSummary')}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {t('deviceManagement.portfolioDescription')}
              </p>
            </div>
            
            <button
              onClick={() => setShowAddCoinForm(true)}
              className="w-full sm:w-auto mt-4 sm:mt-0 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('portfolio.addCoinToPortfolio')}
            </button>
          </div>

          {/* Portfolio Summary */}
          <div className="mb-8">
            <PortfolioSummary coins={coins} />
          </div>

          {/* Portfolio Coins */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t('portfolio.portfolioCoins')}
            </h2>
            
            {coins.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {t('portfolio.emptyPortfolio')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {t('portfolio.emptyPortfolioDesc')}
                </p>
                <button
                  onClick={() => setShowAddCoinForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('portfolio.addCoinToPortfolio')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coins.map((coin) => (
                  <PortfolioCard
                    key={coin.id}
                    coin={coin}
                    onUpdate={(updatedCoin) => updateCoin(coin.id, updatedCoin)}
                    onDelete={() => deleteCoin(coin.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Coin Modal */}
      {showAddCoinForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <AddCoinForm
              onAddCoin={addCoin}
              onClose={() => setShowAddCoinForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

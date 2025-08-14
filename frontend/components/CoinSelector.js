'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { okxService } from '../lib/okx-service';

export const CoinSelector = ({ selectedCoin, onCoinSelect }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [supportedCoins, setSupportedCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // OKX'den desteklenen coinleri çek
  useEffect(() => {
    const fetchSupportedCoins = async () => {
      try {
        setLoading(true);
        setError(null);
        const coins = await okxService.getSupportedCoins();
        setSupportedCoins(coins);
      } catch (err) {
        console.error('Coin listesi çekme hatası:', err);
        setError('Coin listesi yüklenemedi');
        // Fallback olarak config'den coinleri kullan
        import('../lib/config').then(({ config }) => {
          setSupportedCoins(config.supportedCoins);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSupportedCoins();
  }, []);

  // Arama terimine göre filtrelenen coinler
  const filteredCoins = useMemo(() => {
    if (!searchTerm.trim()) {
      return supportedCoins;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return supportedCoins.filter(coin => {
      const coinLower = coin.toLowerCase();
      // Tam eşleşme öncelikli, sonra başlangıç eşleşmesi, sonra içinde geçme
      return coinLower === searchLower || 
             coinLower.startsWith(searchLower) || 
             coinLower.includes(searchLower);
    }).sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Önce tam eşleşme
      if (aLower === searchLower && bLower !== searchLower) return -1;
      if (bLower === searchLower && aLower !== searchLower) return 1;
      
      // Sonra başlangıç eşleşmesi
      const aStarts = aLower.startsWith(searchLower);
      const bStarts = bLower.startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;
      
      // Son olarak alfabetik sıralama
      return a.localeCompare(b);
    });
  }, [searchTerm, supportedCoins]);

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {t('devices.selectCoin')}
        </label>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">
            Coinler yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        {t('devices.selectCoin')}
      </label>
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {error}
          </p>
        </div>
      )}
      
      {/* Arama Kutusu */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder={t('devices.searchCoins') || 'Coin ara... (örn: BTC, ETH)'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 pr-10 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Coin Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {filteredCoins.length > 0 ? (
          filteredCoins.map(coin => (
            <button
              key={coin}
              type="button"
              onClick={() => onCoinSelect(coin)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                selectedCoin === coin
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm font-medium">{coin}</div>
            </button>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
            {t('devices.noCoinsFound') || 'Hiç coin bulunamadı'}
          </div>
        )}
      </div>
      
      {/* Sonuç sayısı */}
      {searchTerm && (
        <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-center">
          {filteredCoins.length} coin bulundu
        </div>
      )}
    </div>
  );
};

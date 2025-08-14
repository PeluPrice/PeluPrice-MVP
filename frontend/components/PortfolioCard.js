'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { okxService } from '../lib/okx-service';

export const PortfolioCard = ({ coin, onUpdate, onRemove }) => {
  const { t } = useTranslation();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Kar/zarar hesaplama
  const totalValue = coin.amount * currentPrice;
  const totalCost = coin.amount * coin.purchasePrice;
  const profitLoss = totalValue - totalCost;
  const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

  // WebSocket fiyat güncellemelerini dinle
  useEffect(() => {
    const handlePriceUpdate = (data) => {
      setCurrentPrice(data.price);
      setPriceChange24h(data.change24h);
      setLastUpdate(new Date(data.lastUpdate));
      setIsConnected(true);
    };

    // Fiyat dinleyicisi ekle
    okxService.addPriceListener(coin.symbol, handlePriceUpdate);

    // İlk fiyatı al
    okxService.getCurrentPrice(coin.symbol).then(price => {
      if (price) {
        setCurrentPrice(price);
        setIsConnected(true);
      }
    }).catch(() => {
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      okxService.removePriceListener(coin.symbol, handlePriceUpdate);
    };
  }, [coin.symbol]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {coin.symbol}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {coin.symbol}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {coin.amount} {coin.symbol}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bağlantı durumu */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} 
               title={isConnected ? 'Canlı' : 'Bağlantı yok'} />
          
          {/* Kaldır butonu */}
          <button
            onClick={() => onRemove(coin.id)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Portföyden kaldır"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fiyat Bilgileri */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('portfolio.currentPrice')}</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {currentPrice > 0 ? formatCurrency(currentPrice) : '--'}
          </p>
          <p className={`text-xs ${priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange24h !== 0 ? formatPercentage(priceChange24h) : '--'}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('portfolio.purchasePrice')}</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {formatCurrency(coin.purchasePrice)}
          </p>
        </div>
      </div>

      {/* Değer Bilgileri */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('portfolio.currentValue')}</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {currentPrice > 0 ? formatCurrency(totalValue) : '--'}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('portfolio.investmentAmount')}</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {formatCurrency(totalCost)}
          </p>
        </div>
      </div>

      {/* Kar/Zarar */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('portfolio.profitLoss')}</p>
          <div className="text-right">
            <p className={`font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentPrice > 0 ? formatCurrency(profitLoss) : '--'}
            </p>
            <p className={`text-sm ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentPrice > 0 && totalCost > 0 ? formatPercentage(profitLossPercentage) : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Son güncelleme */}
      {lastUpdate && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            {t('portfolio.lastUpdate')}: {lastUpdate.toLocaleTimeString('tr-TR')}
          </p>
        </div>
      )}
    </div>
  );
};
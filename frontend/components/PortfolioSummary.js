'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { okxService } from '../lib/okx-service';

export const PortfolioSummary = ({ coins }) => {
  const { t } = useTranslation();
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
    coinPrices: {}
  });

  // Tüm coinlerin fiyatlarını al ve hesapla
  useEffect(() => {
    let totalValue = 0;
    let totalCost = 0;

    coins.forEach(coin => {
      const currentPrice = portfolioData.coinPrices[coin.symbol] || 0;
      const coinValue = coin.amount * currentPrice;
      const coinCost = coin.amount * coin.purchasePrice;
      
      totalValue += coinValue;
      totalCost += coinCost;
    });

    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

    setPortfolioData(prev => ({
      ...prev,
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercentage
    }));
  }, [coins, JSON.stringify(portfolioData.coinPrices)]);

  // WebSocket bağlantıları kur
  useEffect(() => {
    const priceListeners = new Map();

    coins.forEach(coin => {
      const handlePriceUpdate = (data) => {
        setPortfolioData(prev => ({
          ...prev,
          coinPrices: {
            ...prev.coinPrices,
            [coin.symbol]: data.price
          }
        }));
      };

      okxService.addPriceListener(coin.symbol, handlePriceUpdate);
      priceListeners.set(coin.symbol, handlePriceUpdate);

      // İlk fiyatı al
      okxService.getCurrentPrice(coin.symbol).then(price => {
        if (price) {
          setPortfolioData(prev => ({
            ...prev,
            coinPrices: {
              ...prev.coinPrices,
              [coin.symbol]: price
            }
          }));
        }
      });
    });

    // Cleanup
    return () => {
      priceListeners.forEach((listener, symbol) => {
        okxService.removePriceListener(symbol, listener);
      });
    };
  }, [coins]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (coins.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {t('portfolio.emptyPortfolio')}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {t('portfolio.emptyPortfolioDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toplam Portfolyo Değeri */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('portfolio.portfolioSummary')}</h3>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            📊
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">{t('portfolio.totalValue')}</p>
            <p className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</p>
          </div>
          
          <div>
            <p className="text-blue-100 text-sm mb-1">{t('portfolio.totalInvestment')}</p>
            <p className="text-xl font-semibold">{formatCurrency(portfolioData.totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Kar/Zarar Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-xl p-6 ${
          portfolioData.totalProfitLoss >= 0 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">{t('portfolio.profitLoss')}</h4>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              portfolioData.totalProfitLoss >= 0 ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'
            }`}>
              {portfolioData.totalProfitLoss >= 0 ? '📈' : '📉'}
            </div>
          </div>
          <p className={`text-2xl font-bold ${
            portfolioData.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(portfolioData.totalProfitLoss)}
          </p>
          <p className={`text-sm ${
            portfolioData.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(portfolioData.totalProfitLossPercentage)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">{t('portfolio.coinCount')}</h4>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              🪙
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{coins.length}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('portfolio.differentCryptos')}</p>
        </div>
      </div>

      {/* En İyi/En Kötü Performans */}
      {coins.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            let bestCoin = null;
            let worstCoin = null;
            let bestPerformance = -Infinity;
            let worstPerformance = Infinity;

            coins.forEach(coin => {
              const currentPrice = portfolioData.coinPrices[coin.symbol] || 0;
              const performance = currentPrice > 0 ? ((currentPrice - coin.purchasePrice) / coin.purchasePrice) * 100 : 0;
              
              if (performance > bestPerformance) {
                bestPerformance = performance;
                bestCoin = coin;
              }
              
              if (performance < worstPerformance) {
                worstPerformance = performance;
                worstCoin = coin;
              }
            });

            return (
              <>
                {bestCoin && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">{t('portfolio.bestPerformance')}</h5>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-900 dark:text-green-200">{bestCoin.symbol}</span>
                      <span className="text-green-600 font-bold">{formatPercentage(bestPerformance)}</span>
                    </div>
                  </div>
                )}
                
                {worstCoin && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <h5 className="font-medium text-red-800 dark:text-red-300 mb-2">{t('portfolio.worstPerformance')}</h5>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-red-900 dark:text-red-200">{worstCoin.symbol}</span>
                      <span className="text-red-600 font-bold">{formatPercentage(worstPerformance)}</span>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
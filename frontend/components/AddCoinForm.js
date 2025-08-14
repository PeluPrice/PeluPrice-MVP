'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { okxService } from '../lib/okx-service';

export const AddCoinForm = ({ onAddCoin, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    symbol: '',
    amount: '',
    purchasePrice: ''
  });
  const [supportedCoins, setSupportedCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);

  // OKX'den desteklenen coinleri çek
  useEffect(() => {
    const fetchSupportedCoins = async () => {
      try {
        const coins = await okxService.getSupportedCoins();
        setSupportedCoins(coins);
        setFilteredCoins(coins.slice(0, 50)); // İlk 50 coini göster
      } catch (error) {
        console.error('Coin listesi çekme hatası:', error);
      }
    };

    fetchSupportedCoins();
  }, []);

  // Arama filtreleme
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCoins(supportedCoins.slice(0, 50));
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = supportedCoins
      .filter(coin => coin.toLowerCase().includes(searchLower))
      .slice(0, 50);
    
    setFilteredCoins(filtered);
  }, [searchTerm, supportedCoins]);

  // Seçilen coin'in güncel fiyatını al
  useEffect(() => {
    if (formData.symbol) {
      okxService.getCurrentPrice(formData.symbol).then(price => {
        setCurrentPrice(price);
      });
    }
  }, [formData.symbol]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.amount || !formData.purchasePrice) {
      alert(t('portfolio.fillAllFields'));
      return;
    }

    if (isNaN(formData.amount) || isNaN(formData.purchasePrice)) {
      alert(t('portfolio.enterValidNumbers'));
      return;
    }

    if (parseFloat(formData.amount) <= 0 || parseFloat(formData.purchasePrice) <= 0) {
      alert(t('portfolio.positiveNumbers'));
      return;
    }

    const coinData = {
      id: Date.now(), // Basit ID
      symbol: formData.symbol,
      amount: parseFloat(formData.amount),
      purchasePrice: parseFloat(formData.purchasePrice)
    };

    onAddCoin(coinData);
  };

  const handleCoinSelect = (coin) => {
    setFormData(prev => ({ ...prev, symbol: coin }));
    setSearchTerm(coin);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData(prev => ({ ...prev, symbol: value }));
    setShowDropdown(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('portfolio.addCoinToPortfolio')}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Coin Seçimi */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('portfolio.selectCoin')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('portfolio.searchCoinPlaceholder')}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {/* Dropdown */}
            {showDropdown && filteredCoins.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCoins.map(coin => (
                  <button
                    key={coin}
                    type="button"
                    onClick={() => handleCoinSelect(coin)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    {coin}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Güncel fiyat gösterimi */}
          {formData.symbol && currentPrice && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t('portfolio.currentPrice')}: {formatCurrency(currentPrice)}
            </p>
          )}
        </div>

        {/* Miktar */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('portfolio.amount')}
          </label>
          <input
            type="number"
            step="any"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder={t('portfolio.amountPlaceholder')}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Alış Fiyatı */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('portfolio.purchasePrice')} (USD)
          </label>
          <input
            type="number"
            step="any"
            value={formData.purchasePrice}
            onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
            placeholder={t('portfolio.purchasePricePlaceholder')}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Yatırım Özeti */}
        {formData.amount && formData.purchasePrice && !isNaN(formData.amount) && !isNaN(formData.purchasePrice) && (
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('portfolio.investmentSummary')}
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('portfolio.totalInvestment')}:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(parseFloat(formData.amount) * parseFloat(formData.purchasePrice))}
                </span>
              </div>
              {currentPrice && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('portfolio.currentValue')}:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(parseFloat(formData.amount) * currentPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Butonlar */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {loading ? t('common.adding') : t('common.add')}
          </button>
        </div>
      </form>
    </div>
  );
};
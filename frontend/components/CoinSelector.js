'use client';

import { useTranslation } from '../i18n';
import { config } from '../lib/config';

export const CoinSelector = ({ selectedCoin, onCoinSelect }) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        {t('devices.selectCoin')}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {config.supportedCoins.map(coin => (
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
        ))}
      </div>
    </div>
  );
};

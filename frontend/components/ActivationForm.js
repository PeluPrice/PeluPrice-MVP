'use client';

import { useState } from 'react';
import { activateDevice } from '../lib/api';
import { useTranslation } from '../i18n';

export const ActivationForm = ({ onDeviceActivated }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await activateDevice({ code });
      onDeviceActivated(response.data);
      setCode('');
    } catch (err) {
      // API'den gelen gerçek error mesajını göster
      setError(err.message || t('devices.deviceActivationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🧸</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {t('devices.activateDevice')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('devices.enterActivationCode')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="activationCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('devices.activationCode')}
              </label>
              <input
                id="activationCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t('devices.enterActivationCode')}
                className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-200"
                required
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Demo için DEMO1 bir kodunu girebilirsiniz
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t('common.loading')}
                </div>
              ) : (
                t('devices.activateDevice')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

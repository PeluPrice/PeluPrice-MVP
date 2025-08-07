'use client';

import { useState } from 'react';
import { useTranslation } from '../i18n';

export const ThresholdInputs = ({ 
  lowerThreshold, 
  upperThreshold, 
  onLowerChange, 
  onUpperChange, 
  coin,
  alarmsEnabled = true,
  onAlarmsToggle
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Alarms Toggle */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <span className="text-lg sm:text-2xl">🔔</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
              Fiyat Alarmları
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {coin} için fiyat bildirimlerini etkinleştir
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-2">
          <input
            type="checkbox"
            checked={alarmsEnabled}
            onChange={(e) => onAlarmsToggle?.(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {alarmsEnabled && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
            {t('devices.priceThresholds')}
          </h4>
          <div className="space-y-4">
            {/* Lower Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('devices.lowerThreshold')} <span className="text-slate-500">(İsteğe bağlı)</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
                <input
                  type="number"
                  value={lowerThreshold || ''}
                  onChange={(e) => onLowerChange(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="30000"
                  className="w-full pl-8 pr-4 py-2 sm:py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200 text-sm sm:text-base"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('devices.lowerThresholdDesc')}
              </p>
            </div>

            {/* Upper Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('devices.upperThreshold')} <span className="text-slate-500">(İsteğe bağlı)</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
                <input
                  type="number"
                  value={upperThreshold || ''}
                  onChange={(e) => onUpperChange(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="70000"
                  className="w-full pl-8 pr-4 py-2 sm:py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200 text-sm sm:text-base"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('devices.upperThresholdDesc')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

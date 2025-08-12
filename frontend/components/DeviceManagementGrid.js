'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { config } from '../lib/config';
import { CoinSelector } from './CoinSelector';
import { ThresholdInputs } from './ThresholdInputs';
import { VoiceTester } from './VoiceTester';

export const DeviceManagementGrid = ({ device, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    language: 'tr',
    settings: {
      coin: 'BTC',
      lowerThreshold: '',
      upperThreshold: '',
      twitterFollow: {
        enabled: false,
        url: ''
      },
      customSound: '',
      voice: 'voice1',
      alarmsEnabled: true
    }
  });

  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        photo: device.photo || '',
        language: device.language || 'tr',
        settings: {
          coin: device.settings?.coin || 'BTC',
          lowerThreshold: device.settings?.lowerThreshold || '',
          upperThreshold: device.settings?.upperThreshold || '',
          twitterFollow: {
            enabled: device.settings?.twitterFollow?.enabled || false,
            url: device.settings?.twitterFollow?.url || ''
          },
          customSound: device.settings?.customSound || '',
          voice: device.settings?.voice || 'voice1',
          alarmsEnabled: device.settings?.alarmsEnabled ?? true
        }
      });
    }
  }, [device]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name.trim()) {
      alert(t('forms.nameRequired'));
      return;
    }

    if (!formData.settings.lowerThreshold || !formData.settings.upperThreshold) {
      alert(t('forms.thresholdsRequired'));
      return;
    }

    if (Number(formData.settings.lowerThreshold) >= Number(formData.settings.upperThreshold)) {
      alert(t('forms.thresholdOrderError'));
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSetting = (key, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  const updateTwitterSetting = (key, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        twitterFollow: {
          ...prev.settings.twitterFollow,
          [key]: value
        }
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Grid Layout - Full width optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 lg:gap-4 h-full w-full">
        
        {/* Left Column: Basic Info + Voice Settings */}
        <div className="lg:col-span-2 space-y-3 lg:space-y-4">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                🧸
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white ml-3">
                {t('devices.basicInformation')}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('forms.deviceName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200"
                  placeholder={t('forms.enterDeviceName')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('forms.language')}
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => updateField('language', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200"
                >
                  {config.supportedLanguages?.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Device Code Display */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cihaz Kodu
                </label>
                <div className="px-4 py-3 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-xl">
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {device?.deviceCode || 'Yükleniyor...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Settings Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5 hover:shadow-2xl transition-all duration-300 flex-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white text-xl">
                🔊
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white ml-3">
                {t('devices.voiceSettings')}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('devices.voiceType')}
                </label>
                <select
                  value={formData.settings.voice}
                  onChange={(e) => updateSetting('voice', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200"
                >
                  {config.voiceOptions.map(voice => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </div>

              <VoiceTester voice={formData.settings.voice} />

              {/* Volume Control */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ses Seviyesi
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>Sessiz</span>
                  <span>Yüksek</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Social Media + Device Status + Quick Actions */}
        <div className="lg:col-span-2 space-y-3 lg:space-y-4">
          {/* Social Media Integration Card */}
          {/* <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl">
                🐦
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white ml-3">
                {t('devices.socialMedia')}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.twitterFollow.enabled}
                  onChange={(e) => updateTwitterSetting('enabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('devices.enableTwitterFollow')}
                </label>
              </div>
              
              {formData.settings.twitterFollow.enabled && (
                <input
                  type="url"
                  value={formData.settings.twitterFollow.url}
                  onChange={(e) => updateTwitterSetting('url', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200"
                  placeholder="https://twitter.com/username"
                />
              )} */}

              {/* Additional Social Features */}
              {/* <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Otomatik Paylaşım</span>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">Fiyat Etiketleme</span>
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                </div>
              </div>
            </div>
          </div> */}

          {/* Device Status Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl">
                📊
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white ml-3">
                Cihaz Durumu
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bağlantı</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Çevrimiçi
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Son Sinyal</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">2 dakika önce</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pil Durumu</span>
                <div className="flex items-center">
                  <div className="w-8 h-4 bg-slate-300 dark:bg-slate-600 rounded-sm mr-2">
                    <div className="w-6 h-full bg-green-500 rounded-sm"></div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">85%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">WiFi Kalitesi</span>
                <div className="flex items-center">
                  <div className="flex space-x-1 mr-2">
                    <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">İyi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5 hover:shadow-2xl transition-all duration-300 flex-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white ml-3">
                Hızlı İşlemler
              </h3>
            </div>
            
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9.879 9.879l4.242 4.242" />
                </svg>
                Test Sesi Çal
              </button>
              
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Cihazı Yeniden Başlat
              </button>
              
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bağlantı Testi Yap
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
                Firmware Güncelle
              </button>
            </div>
          </div>
        </div>

        {/* Cryptocurrency Settings Card - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl">
              ₿
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white ml-4">
              {t('devices.cryptoSettings')}
            </h3>
          </div>
          
          <div className="space-y-6">
            <CoinSelector
              selectedCoin={formData.settings.coin}
              onCoinSelect={(coin) => updateSetting('coin', coin)}
            />
            
            <ThresholdInputs
              lowerThreshold={formData.settings.lowerThreshold}
              upperThreshold={formData.settings.upperThreshold}
              onLowerChange={(value) => updateSetting('lowerThreshold', value)}
              onUpperChange={(value) => updateSetting('upperThreshold', value)}
              coin={formData.settings.coin}
              alarmsEnabled={formData.settings.alarmsEnabled}
              onAlarmsToggle={(value) => updateSetting('alarmsEnabled', value)}
            />
          </div>
        </div>
      </div>

      {/* Save Button - Full Width */}
      <div className="flex justify-center pt-6">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none min-w-[200px]"
        >
          {saving ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {t('common.saving')}
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {device ? t('devices.updateDevice') : t('devices.saveDevice')}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default DeviceManagementGrid;

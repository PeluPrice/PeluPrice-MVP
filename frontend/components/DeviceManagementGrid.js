'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { config } from '../lib/config';
import { CoinSelector } from './CoinSelector';
import { ThresholdInputs } from './ThresholdInputs';
import { VoiceTester } from './VoiceTester';
import { AddCoinForm } from './AddCoinForm';
import { PortfolioCard } from './PortfolioCard';
import { PortfolioSummary } from './PortfolioSummary';

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
      alarmsEnabled: true,
      portfolio: {
        enabled: false,
        coins: [], // { symbol: 'BTC', amount: 0.5, purchasePrice: 50000 }
        alertTime: '09:00',
        timezone: 'Europe/Istanbul',
        dailyReportEnabled: true
      }
    }
  });

  const [saving, setSaving] = useState(false);
  const [showAddCoinForm, setShowAddCoinForm] = useState(false);
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
          alarmsEnabled: device.settings?.alarmsEnabled ?? true,
          portfolio: {
            enabled: device.settings?.portfolio?.enabled || false,
            coins: device.settings?.portfolio?.coins || [],
            alertTime: device.settings?.portfolio?.alertTime || '09:00',
            timezone: device.settings?.portfolio?.timezone || 'Europe/Istanbul',
            dailyReportEnabled: device.settings?.portfolio?.dailyReportEnabled ?? true
          }
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

  const updatePortfolioSetting = (key, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        portfolio: {
          ...prev.settings.portfolio,
          [key]: value
        }
      }
    }));
  };

  const addCoinToPortfolio = () => {
    setShowAddCoinForm(true);
  };

  const handleAddCoin = (coinData) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        portfolio: {
          ...prev.settings.portfolio,
          coins: [...prev.settings.portfolio.coins, coinData]
        }
      }
    }));
    setShowAddCoinForm(false);
  };

  const removeCoinFromPortfolio = (coinId) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        portfolio: {
          ...prev.settings.portfolio,
          coins: prev.settings.portfolio.coins.filter(coin => coin.id !== coinId)
        }
      }
    }));
  };

  const updatePortfolioCoin = (coinId, field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        portfolio: {
          ...prev.settings.portfolio,
          coins: prev.settings.portfolio.coins.map(coin => 
            coin.id === coinId ? { ...coin, [field]: value } : coin
          )
        }
      }
    }));
  };

  return (
    <>
      {/* AddCoinForm Modal */}
      {showAddCoinForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <AddCoinForm 
              onAddCoin={handleAddCoin}
              onCancel={() => setShowAddCoinForm(false)}
            />
          </div>
        </div>
      )}

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
                    {device?.deviceCode || device?.id || 'Loading...'}
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
                  {config.voiceOptions.map(voice => {
                    const genderText = voice.gender ? t(`devices.${voice.gender}`) : '';
                    const displayName = `${voice.name} (${genderText})`;
                    return (
                      <option key={voice.id} value={voice.id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <VoiceTester voice={formData.settings.voice} />

              {/* Volume Control */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('devices.volumeLevel')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="80"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{t('devices.silent')}</span>
                  <span>{t('devices.loud')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Social Media + Device Status + Quick Actions */}
        <div className="lg:col-span-2 space-y-3 lg:space-y-4">
          {/* Social Media Integration Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5 hover:shadow-2xl transition-all duration-300">
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
              )} 

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
              </div> */}
            </div>
          </div> 

          {/* Device Status Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 lg:p-5 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl">
                📊
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white ml-3">
                {t('devices.deviceStatus')}
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('devices.connection')}</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {t('devices.online')}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('devices.lastSignal')}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">2 {t('devices.minutesAgo')}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('devices.batteryStatus')}</span>
                <div className="flex items-center">
                  <div className="w-8 h-4 bg-slate-300 dark:bg-slate-600 rounded-sm mr-2">
                    <div className="w-6 h-full bg-green-500 rounded-sm"></div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">85%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('devices.wifiQuality')}</span>
                <div className="flex items-center">
                  <div className="flex space-x-1 mr-2">
                    <div className="w-1 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('devices.good')}</span>
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
                {t('devices.quickActions')}
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
                {t('devices.testSound')}
              </button>
              
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('devices.restartDevice')}
              </button>
              
              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('devices.connectionTest')}
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
                {t('devices.updateFirmware')}
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

      {/* Portfolio Management - Full Width Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
              💼
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('devices.portfolioManagement')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('devices.portfolioDescription')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.settings.portfolio.enabled}
                onChange={(e) => updatePortfolioSetting('enabled', e.target.checked)}
                className="w-5 h-5 text-green-600 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <label className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('devices.enablePortfolioTracking')}
              </label>
            </div>
          </div>
        </div>

        {formData.settings.portfolio.enabled && (
          <div className="space-y-6">
            {/* Portfolio Settings */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('devices.dailyReportTime')}
                </label>
                <input
                  type="time"
                  value={formData.settings.portfolio.alertTime}
                  onChange={(e) => updatePortfolioSetting('alertTime', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('devices.timezone')}
                </label>
                <select
                  value={formData.settings.portfolio.timezone}
                  onChange={(e) => updatePortfolioSetting('timezone', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-800 dark:text-slate-200"
                >
                  <option value="Europe/Istanbul">🇹🇷 İstanbul (UTC+3)</option>
                  <option value="UTC">🌍 UTC (GMT+0)</option>
                  <option value="Europe/London">🇬🇧 Londra (GMT+0/+1)</option>
                  <option value="Europe/Berlin">🇩🇪 Berlin (UTC+1)</option>
                  <option value="Europe/Paris">🇫🇷 Paris (UTC+1)</option>
                  <option value="America/New_York">🇺🇸 New York (UTC-5)</option>
                  <option value="America/Los_Angeles">🇺🇸 Los Angeles (UTC-8)</option>
                  <option value="America/Chicago">🇺🇸 Chicago (UTC-6)</option>
                  <option value="Asia/Tokyo">🇯🇵 Tokyo (UTC+9)</option>
                  <option value="Asia/Shanghai">🇨🇳 Şangay (UTC+8)</option>
                  <option value="Asia/Dubai">🇦🇪 Dubai (UTC+4)</option>
                  <option value="Australia/Sydney">🇦🇺 Sidney (UTC+10)</option>
                  <option value="Asia/Kolkata">🇮🇳 Yeni Delhi (UTC+5:30)</option>
                  <option value="Europe/Moscow">🇷🇺 Moskova (UTC+3)</option>
                  <option value="Asia/Seoul">🇰🇷 Seul (UTC+9)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.portfolio.dailyReportEnabled}
                  onChange={(e) => updatePortfolioSetting('dailyReportEnabled', e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  {t('devices.dailyVoiceReport')}
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addCoinToPortfolio}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('portfolio.addCoin')}
                </button>
              </div>
            </div>

            {/* Portfolyo Yönetimi */}
            <div>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                {t('devices.myPortfolioCoins')}
              </h4>
              
              {/* Portfolyo Özeti */}
              <div className="mb-6">
                <PortfolioSummary coins={formData.settings.portfolio.coins} />
              </div>

              {/* Portfolyo Coinleri */}
              {formData.settings.portfolio.coins.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                    {t('portfolio.noCoinAdded')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {t('portfolio.addCoinsToTrack')}
                  </p>
                  <button
                    type="button"
                    onClick={addCoinToPortfolio}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    {t('portfolio.addFirstCoin')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-md font-medium text-slate-700 dark:text-slate-300">
                      {t('portfolio.portfolioCoins')} ({formData.settings.portfolio.coins.length})
                    </h5>
                    <button
                      type="button"
                      onClick={addCoinToPortfolio}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {t('portfolio.addCoin')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.settings.portfolio.coins.map((coin) => (
                      <PortfolioCard
                        key={coin.id}
                        coin={coin}
                        onUpdate={(field, value) => updatePortfolioCoin(coin.id, field, value)}
                        onRemove={removeCoinFromPortfolio}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio Summary için yer tutma - artık PortfolioSummary bileşeni kullanılıyor */}
            {/* <div>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t('devices.myPortfolioCoins')}</h4>
              
              {formData.settings.portfolio.coins.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                    {t('portfolio.noCoinAdded')}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {t('portfolio.addCoinsToTrack')}
                  </p>
                  <button
                    type="button"
                    onClick={addCoinToPortfolio}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    {t('portfolio.addFirstCoin')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.settings.portfolio.coins.map((coin, index) => (
                    <div key={index} className="p-5 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {coin.symbol.slice(0,3)}
                          </div>
                          <div className="ml-3">
                            <h5 className="font-semibold text-slate-800 dark:text-slate-200">{coin.symbol}</h5>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Coin #{index + 1}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCoinFromPortfolio(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('devices.cryptocurrency')}
                          </label>
                          <select
                            value={coin.symbol}
                            onChange={(e) => updatePortfolioCoin(index, 'symbol', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-800 dark:text-slate-200"
                          >
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="BNB">Binance Coin (BNB)</option>
                            <option value="ADA">Cardano (ADA)</option>
                            <option value="DOT">Polkadot (DOT)</option>
                            <option value="XRP">Ripple (XRP)</option>
                            <option value="LTC">Litecoin (LTC)</option>
                            <option value="LINK">Chainlink (LINK)</option>
                            <option value="SOL">Solana (SOL)</option>
                            <option value="DOGE">Dogecoin (DOGE)</option>
                            <option value="AVAX">Avalanche (AVAX)</option>
                            <option value="MATIC">Polygon (MATIC)</option>
                            <option value="ATOM">Cosmos (ATOM)</option>
                            <option value="NEAR">Near Protocol (NEAR)</option>
                            <option value="FTM">Fantom (FTM)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('devices.amountOwned')}
                          </label>
                          <input
                            type="number"
                            step="0.00000001"
                            value={coin.amount}
                            onChange={(e) => updatePortfolioCoin(index, 'amount', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-800 dark:text-slate-200"
                            placeholder="0.00000000"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {t('devices.avgPurchasePrice')}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={coin.purchasePrice}
                            onChange={(e) => updatePortfolioCoin(index, 'purchasePrice', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-800 dark:text-slate-200"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      
                      {/* Coin Performance Preview */}
                      {/* {coin.amount && coin.purchasePrice && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                ${(parseFloat(coin.amount) * parseFloat(coin.purchasePrice)).toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{t('devices.investmentAmount')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                $--
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{t('devices.currentValue')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                $--
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{t('devices.profitLoss')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">
                                --%
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{t('devices.change')}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>  */}
          </div>
        )}
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
    </>
  );
};

// export { DeviceManagementGrid };

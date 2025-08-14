'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { config } from '../lib/config';
import { CoinSelector } from './CoinSelector';
import { ThresholdInputs } from './ThresholdInputs';
import { VoiceTester } from './VoiceTester';

export const DeviceForm = ({ device, onSave, saving }) => {
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

    await onSave(formData);
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
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 shadow-2xl border border-white/20 dark:border-slate-700/50">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {device ? t('devices.editDevice') : t('devices.addDevice')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t('devices.configureYourPlushie')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div className="bg-white/5 dark:bg-slate-800/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 dark:border-slate-700/30">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 flex items-center">
              <div className="text-xl sm:text-2xl mr-2 sm:mr-3">🧸</div>
              <span className="truncate">{t('devices.basicInformation')}</span>
            </h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('forms.deviceName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200 text-sm sm:text-base"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200 text-sm sm:text-base"
                >
                  {config.supportedLanguages?.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cryptocurrency Settings */}
          <div className="bg-white/5 dark:bg-slate-800/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 dark:border-slate-700/30">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 flex items-center">
              <div className="text-2xl mr-3">₿</div>
              {t('devices.cryptoSettings')}
            </h3>
            
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

          {/* Social Media Integration */}
          <div className="bg-white/5 dark:bg-slate-800/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 dark:border-slate-700/30">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 flex items-center">
              <div className="text-xl sm:text-2xl mr-2 sm:mr-3">🐦</div>
              <span className="truncate">{t('devices.socialMedia')}</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.twitterFollow.enabled}
                  onChange={(e) => updateTwitterSetting('enabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2 flex-shrink-0"
                />
                <label className="ml-2 text-sm text-slate-700 dark:text-slate-300 truncate">
                  {t('devices.enableTwitterFollow')}
                </label>
              </div>
              
              {formData.settings.twitterFollow.enabled && (
                <input
                  type="url"
                  value={formData.settings.twitterFollow.url}
                  onChange={(e) => updateTwitterSetting('url', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200 text-sm sm:text-base"
                  placeholder="https://twitter.com/username"
                />
              )}
            </div>
          </div>

          {/* Voice Settings */}
          <div className="bg-white/5 dark:bg-slate-800/30 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-white/10 dark:border-slate-700/30">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 flex items-center">
              <div className="text-xl sm:text-2xl mr-2 sm:mr-3">🔊</div>
              <span className="truncate">{t('devices.voiceSettings')}</span>
            </h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <span className="truncate">{t('devices.voiceType')}</span>
                </label>
                <select
                  value={formData.settings.voice}
                  onChange={(e) => updateSetting('voice', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 dark:text-slate-200 text-sm sm:text-base"
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

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <span className="truncate">{t('devices.customSound')}</span>
                </label>
                {/* <FileUploader
                  currentFile={formData.settings.customSound}
                  onFileUpload={(url) => updateSetting('customSound', url)}
                  accept="audio/*"
                  label={t('devices.uploadCustomSound')}
                /> */}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center sm:justify-end pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm sm:text-base"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="truncate">{t('common.saving')}</span>
                </div>
              ) : (
                <span className="truncate">
                  {device ? t('devices.updateDevice') : t('devices.saveDevice')}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceForm;

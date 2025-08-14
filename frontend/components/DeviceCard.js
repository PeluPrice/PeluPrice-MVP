'use client';

import Image from 'next/image';
import { useTranslation } from '../i18n';

export const DeviceCard = ({ device, onSelect }) => {
  const { t } = useTranslation();

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        {/* {device.photo ? (
          <Image
            src={device.photo}
            alt={device.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        ) : ( */}
          <div className="w-full h-48 flex items-center justify-center">
            <div className="text-6xl opacity-60 group-hover:scale-110 transition-transform duration-300">🧸</div>
          </div>
        {/* )} */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate pr-2">
            {device.name || `Device ${device.deviceCode || device.id}`}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
            {device.deviceCode || device.id}
          </span>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            {/* <span className="text-slate-600 dark:text-slate-400">{t('devices.speakingLanguage')}:</span> */}
            {/* <span className="font-medium text-slate-900 dark:text-white">{t(`languages.${device.language}`)}</span> */}
          </div>
          
          {/* {device.settings?.coin && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">{t('devices.coinTracking')}:</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                {device.settings.coin}
              </span>
            </div>
          )} */}
          
          {/* {device.settings?.lowerThreshold && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">{t('devices.lowerThreshold')}:</span>
              <span className="font-medium text-red-600 dark:text-red-400">${device.settings.lowerThreshold.toLocaleString()}</span>
            </div>
          )} */}
          
          {/* {device.settings?.upperThreshold && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">{t('devices.upperThreshold')}:</span>
              <span className="font-medium text-green-600 dark:text-green-400">${device.settings.upperThreshold.toLocaleString()}</span>
            </div>
          )} */}
        </div>
        
        <button
          onClick={onSelect}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          {t('navigation.deviceManagement')}
        </button>
      </div>
    </div>
  );
};

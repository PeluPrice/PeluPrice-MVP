'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getDevices } from '../../../lib/api';
import { useTranslation } from '../../../i18n';
import { Navbar } from '../../../components/Navbar';
import { DeviceCard } from '../../../components/DeviceCard';
import { ActivationForm } from '../../../components/ActivationForm';
import { DeviceForm } from '../../../components/DeviceForm';
import { DeviceManagementGrid } from '../../../components/DeviceManagementGrid';

export default function DashboardPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActivationForm, setShowActivationForm] = useState(false);

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Auth loading bitene kadar bekle
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const loadDevices = async () => {
      try {
        const response = await getDevices();
        // API response'ını normalize et
        const devicesData = response.data || response || [];
        setDevices(Array.isArray(devicesData) ? devicesData : []);
      } catch (err) {
        console.error('Device loading error:', err);
        setError(err.message || 'Cihazlar yüklenirken hata oluştu');
        setDevices([]); // Hata durumunda boş array
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, [authLoading, isAuthenticated, router]);

  const handleDeviceActivated = (newDevice) => {
    setDevices(prevDevices => [...(prevDevices || []), newDevice]);
  };

  const handleDeviceSelect = (deviceId) => {
    router.push(`/devices/${deviceId}`);
  };

  const handleDeviceUpdate = (updatedDevice) => {
    setDevices(prevDevices => 
      (prevDevices || []).map(device => 
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 absolute top-0"></div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-300 font-medium">{t('auth.authenticating')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 absolute top-0"></div>
          </div>
          <p className="mt-6 text-slate-600 dark:text-slate-300 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      
      <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {(devices && Array.isArray(devices) && devices.length === 0) ? (
          // No devices - Show activation form
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('devices.noDevices')}</h2>
                <p className="text-slate-600 dark:text-slate-300">{t('devices.activationDescription')}</p>
              </div>
              <ActivationForm onDeviceActivated={handleDeviceActivated} />
            </div>
          </div>
        ) : (devices && Array.isArray(devices) && devices.length === 1) ? (
          // Single device - Show management interface in grid cards
          <div className="w-full max-w-none px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('navigation.deviceManagement')}</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  {(devices[0]?.name) || `Device ${devices[0]?.deviceCode || devices[0]?.device_code || 'Unknown'}`}
                </p>
              </div>
              <button
                onClick={() => setShowActivationForm(true)}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('navigation.addDevice')}
              </button>
            </div>

            <DeviceManagementGrid device={devices[0]} onSave={handleDeviceUpdate} />
          </div>
        ) : (
          // Multiple devices - Show card grid
          <div className="w-full max-w-none px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('navigation.myPlushies')}</h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                  {(devices && devices.length) || 0} aktif cihaz yönetiliyor
                </p>
              </div>
              <button
                onClick={() => setShowActivationForm(true)}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('navigation.addDevice')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
              {(devices && Array.isArray(devices)) ? devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onSelect={() => handleDeviceSelect(device.id)}
                />
              )) : null}
            </div>
          </div>
        )}

        {/* Activation Modal */}
        {showActivationForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('navigation.addDevice')}</h3>
                <button
                  onClick={() => setShowActivationForm(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ActivationForm
                onDeviceActivated={(newDevice) => {
                  handleDeviceActivated(newDevice);
                  setShowActivationForm(false);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

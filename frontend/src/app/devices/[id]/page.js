'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getDevices, updateDevice, deleteDevice } from '../../../../lib/api';
import { useTranslation } from '../../../../i18n';
import { Navbar } from '../../../../components/Navbar';
import { DeviceManagementGrid } from '../../../../components/DeviceManagementGrid';
import { ConfirmModal } from '../../../../components/ConfirmModal';

export default function DeviceManagementPage({ params }) {
  const resolvedParams = use(params);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const loadDevice = async () => {
      try {
        const response = await getDevices();
        // API response'ını normalize et
        const devicesData = response.data || response || [];
        const devices = Array.isArray(devicesData) ? devicesData : [];
        const foundDevice = devices.find(d => d.id === resolvedParams.id);
        if (!foundDevice) {
          router.push('/dashboard');
          return;
        }
        setDevice(foundDevice);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDevice();
  }, [isAuthenticated, router, resolvedParams.id]);

  const handleSave = async (updatedDevice) => {
    setSaving(true);
    setError('');

    try {
      const response = await updateDevice(device.id, updatedDevice);
      // API response'ını normalize et
      const updatedData = response.data || response;
      setDevice(updatedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (confirmText) => {
    if (confirmText !== t('devices.typeRemove')) {
      throw new Error('Confirmation text does not match');
    }

    await deleteDevice(device.id);
    router.push('/dashboard');
  };

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

  if (!device) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Navbar />
        <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cihaz Bulunamadı</h2>
                <p className="text-slate-600 dark:text-slate-300">Bu cihaz mevcut değil veya size ait değil</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard'a Dön
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      
      <main className="w-full px-2 sm:px-4 lg:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('navigation.deviceManagement')}</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {device?.name || `Device ${device?.deviceCode || device?.device_code || 'Unknown'}`}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('navigation.myPlushies')}
          </button>
        </div>

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

        <DeviceManagementGrid device={device} onSave={handleSave} />

        {/* Delete Device Section */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {t('devices.removeDevice')}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                {t('devices.removeConfirmation')}
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              {t('devices.removeDevice')}
            </button>
          </div>
        </div>

        {showDeleteModal && (
          <ConfirmModal
            title={t('devices.removeDevice')}
            message={t('devices.removeConfirmation')}
            confirmText={t('devices.typeRemove')}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteModal(false)}
            destructive
          />
        )}
      </main>
    </div>
  );
}

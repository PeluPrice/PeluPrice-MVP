'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { getDevices, updateDevice, deleteDevice } from '../../../../lib/api';
import { useTranslation } from '../../../../i18n';
import { Navbar } from '../../../../components/Navbar';
import { DeviceForm } from '../../../../components/DeviceForm';
import { ConfirmModal } from '../../../../components/ConfirmModal';

export default function DeviceManagementPage({ params }) {
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
        const foundDevice = response.data.find(d => d.id === params.id);
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
  }, [isAuthenticated, router, params.id]);

  const handleSave = async (updatedDevice) => {
    setSaving(true);
    setError('');

    try {
      const response = await updateDevice(device.id, updatedDevice);
      setDevice(response.data);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Device not found</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('devices.deviceManagement')}</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← {t('navigation.myPlushies')}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <DeviceForm
              device={device}
              onSave={handleSave}
              saving={saving}
            />
          </div>
          
          <div className="border-t px-6 py-4">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
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

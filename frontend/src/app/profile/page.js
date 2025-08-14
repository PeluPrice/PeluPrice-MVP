'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../i18n';
import { Navbar } from '../../../components/Navbar';
import { useEffect } from 'react';
import { updateProfile } from '../../../lib/api';

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  // User bilgileri yüklendiğinde form data'yı güncelle
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await updateProfile(formData);
      setSuccess('Profil başarıyla güncellendi!');
      setEditing(false);
      
      // AuthContext'teki user'ı güncelle
      updateUser(response.data);
      
      // Success mesajını 3 saniye sonra gizle
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navbar />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-3/4 -right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      {authLoading ? (
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Profil yükleniyor...</p>
          </div>
        </div>
      ) : (
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 animate-bounce-in">
                <span className="text-4xl">👤</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {t('profile.editProfile')}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Kişisel bilgilerinizi güncelleyin
              </p>
            </div>
            
            {/* Error/Success Messages */}
            {error && (
              <div className="mx-auto max-w-2xl mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mx-auto max-w-2xl mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <span>✅</span>
                    <span>{success}</span>
                  </div>
                </div>
              </div>
            )}
          
          {/* Profile Card */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/30 overflow-hidden animate-slide-up">
            <div className="p-8">
              {/* Personal Info Section */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    {t('profile.personalInfo')}
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Email - Read only */}
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('common.email')}
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('common.firstName')}
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-slate-800 dark:text-slate-200 ${
                          editing 
                            ? 'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 cursor-default'
                        }`}
                      />
                    </div>
                    
                    <div className="group">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('common.lastName')}
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={!editing}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-slate-800 dark:text-slate-200 ${
                          editing 
                            ? 'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 cursor-default'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('common.phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={!editing}
                      className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-slate-800 dark:text-slate-200 ${
                        editing 
                          ? 'bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                          : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 cursor-default'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 flex justify-center items-center py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center space-x-2">
                      <span>✏️</span>
                      <span>{t('common.edit')}</span>
                    </div>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex justify-center items-center py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {saving ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('common.loading')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>💾</span>
                          <span>{t('common.save')}</span>
                        </div>
                      )}
                    </button>
                    
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 flex justify-center items-center py-4 px-6 bg-slate-500 hover:bg-slate-600 disabled:bg-slate-400 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center space-x-2">
                        <span>❌</span>
                        <span>{t('common.cancel')}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 p-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">ℹ️</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Hesap Bilgileri
              </h3>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p><span className="font-medium">Hesap Tipi:</span> Demo Hesap</p>
              <p><span className="font-medium">Üyelik Tarihi:</span> {new Date(user?.createdAt || Date.now()).toLocaleDateString('tr-TR')}</p>
              <p><span className="font-medium">Son Güncelleme:</span> {new Date().toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </main>
      )}
    </div>
  );
}

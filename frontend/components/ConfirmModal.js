'use client';

import { useState } from 'react';
import { useTranslation } from '../i18n';

export const ConfirmModal = ({ 
  title, 
  message, 
  confirmText, 
  onConfirm, 
  onCancel, 
  destructive = false 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { t } = useTranslation();

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      await onConfirm(inputValue);
      onCancel();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = inputValue.trim() === confirmText;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
        
        <p className="text-gray-700 mb-4">
          {message}
        </p>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={confirmText}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
        />
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            {t('common.cancel')}
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!isValid || loading}
            className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              destructive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? t('common.loading') : t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

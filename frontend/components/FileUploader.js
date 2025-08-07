'use client';

import { useState } from 'react';
import { useTranslation } from '../i18n';

export const FileUploader = ({ currentFile, onFileUpload, accept, label }) => {
  const [uploading, setUploading] = useState(false);
  const { t } = useTranslation();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // In demo mode, create a fake URL
      const fakeUrl = URL.createObjectURL(file);
      onFileUpload(fakeUrl);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer bg-white/30 dark:bg-slate-800/30 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">{t('common.uploading')}</span>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">{label}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {accept?.includes('image') ? 'PNG, JPG, GIF (MAX. 10MB)' : 'MP3, WAV, OGG (MAX. 5MB)'}
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
            disabled={uploading}
          />
        </label>
      </div>

      {currentFile && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-blue-600 dark:text-blue-400">
                {accept?.includes('image') ? '📷' : '🔊'}
              </div>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                {t('common.fileUploaded')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onFileUpload('')}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
            >
              {t('common.remove')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

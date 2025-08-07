'use client';

import { useState } from 'react';
import { useTranslation } from '../i18n';
import { config } from '../lib/config';

export const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale, changeLanguage } = useTranslation();

  const handleLanguageChange = async (newLocale) => {
    await changeLanguage(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 focus:outline-none"
      >
        <span>{t(`languages.${locale}`)}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 border">
          <div className="py-1">
            {config.supportedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  locale === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                {t(`languages.${lang}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

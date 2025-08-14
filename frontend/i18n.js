'use client';

import { useState, useEffect, createContext, useContext } from 'react';

const locales = ['tr', 'en', 'de', 'fr'];

// Create a context for translations
const TranslationContext = createContext(null);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    // Fallback if not using provider
    return {
      t: (key) => {
        if (key === 'common.loading') return 'Loading...';
        return key;
      },
      locale: 'tr',
      changeLanguage: () => {},
      isLoading: false
    };
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [locale, setCurrentLocale] = useState('tr');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale');
      if (stored && locales.includes(stored)) {
        setCurrentLocale(stored);
      }
    }
  }, []);

  // Load messages when locale changes
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        let msgs;
        switch (locale) {
          case 'tr':
            msgs = await import('./messages/tr.json');
            break;
          case 'en':
            msgs = await import('./messages/en.json');
            break;
          case 'de':
            msgs = await import('./messages/de.json');
            break;
          case 'fr':
            msgs = await import('./messages/fr.json');
            break;
          default:
            msgs = await import('./messages/tr.json');
            break;
        }
        setTranslations(msgs.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to Turkish
        try {
          const msgs = await import('./messages/tr.json');
          setTranslations(msgs.default);
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [locale]);

  const t = (key) => {
    // If translations are still loading, return a fallback
    if (isLoading) {
      if (key === 'common.loading') return 'Loading...';
      return key;
    }
    
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const changeLanguage = (newLocale) => {
    if (locales.includes(newLocale)) {
      setCurrentLocale(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);
      }
    }
  };

  const value = {
    t,
    locale,
    changeLanguage,
    isLoading
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const isValidLocale = (locale) => {
  return locales.includes(locale);
};

export { locales };

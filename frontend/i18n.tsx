'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

const locales = ['tr', 'en', 'de', 'fr'] as const;

// Define types for the translation context
interface TranslationContextType {
  t: (key: string) => string;
  locale: string;
  changeLanguage: (locale: string) => void;
}

// Create a context for translations
const TranslationContext = createContext<TranslationContextType>({
  t: (key: string) => key,
  locale: 'tr',
  changeLanguage: () => {}
});

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    // Fallback if not using provider
    return {
      t: (key: string) => key,
      locale: 'tr',
      changeLanguage: () => {}
    };
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [locale, setCurrentLocale] = useState<string>('tr');
  const [translations, setTranslations] = useState<any>({});

  // Initialize locale from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale');
      if (stored && (locales as readonly string[]).includes(stored)) {
        setCurrentLocale(stored);
      }
    }
  }, []);

  // Load messages when locale changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        let msgs;
        switch (locale) {
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
        const msgs = await import('./messages/tr.json');
        setTranslations(msgs.default);
      }
    };
    
    loadMessages();
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const changeLanguage = (newLocale: string) => {
    if ((locales as readonly string[]).includes(newLocale)) {
      setCurrentLocale(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', newLocale);
      }
    }
  };

  const value = {
    t,
    locale,
    changeLanguage
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const isValidLocale = (locale: string): boolean => {
  return (locales as readonly string[]).includes(locale);
};

export { locales };

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations, type Locale, type TranslationKey } from './translations';

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);
const STORAGE_KEY = 'figure-collector-locale';

const getInitialLocale = (): Locale => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'ru') return saved;
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
};

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nValue>(() => ({
    locale,
    setLocale,
    t: (key, values = {}) => Object.entries(values).reduce(
      (result, [name, replacement]) => result.replaceAll(`{${name}}`, String(replacement)),
      translations[locale][key] as string,
    ),
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nValue => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};

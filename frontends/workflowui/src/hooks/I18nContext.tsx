/**
 * I18n Context - React internationalization provider and hook
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  translations,
  defaultLocale,
  localeNames,
  supportedLocales,
  type Locale,
} from '@metabuilder/translations';
import {
  detectLocale,
  buildTranslator,
} from './hooks/i18nUtils';
import type {
  I18nContextValue,
  I18nProviderProps,
} from './i18nTypes';

export type { I18nContextValue, I18nProviderProps };

const I18nContext =
  createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale ?? defaultLocale
  );

  useEffect(() => {
    if (!initialLocale) {
      setLocaleState(detectLocale());
    }
  }, [initialLocale]);

  const currentTranslations = useMemo(
    () =>
      translations[locale] ?? translations[defaultLocale],
    [locale]
  );

  const t = useCallback(
    buildTranslator(
      currentTranslations as Record<string, unknown>
    ),
    [currentTranslations]
  );

  const setLocale = useCallback((newLocale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    setLocaleState(newLocale);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t,
      setLocale,
      translations: currentTranslations,
      supportedLocales,
      localeNames,
    }),
    [locale, t, setLocale, currentTranslations]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error(
      'useI18n must be used within an I18nProvider'
    );
  }
  return context;
}

export default I18nProvider;

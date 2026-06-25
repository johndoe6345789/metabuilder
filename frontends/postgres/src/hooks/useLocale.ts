/**
 * Locale state for the admin dashboard.
 *
 * The dashboard lives outside the `[locale]` route tree, so locale is held
 * client-side: detected from localStorage (then the browser language), applied
 * to <html lang>, and persisted. `AdminI18nProvider` calls this once and feeds
 * the value to NextIntlClientProvider; everything else reads it via context.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

export const LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'zh'] as const;
export type LocaleCode = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
};

export const LOCALE_STORAGE_KEY = 'pg-admin-locale';

function isLocale(value: string | null): value is LocaleCode {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

function detectLocale(): LocaleCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // ignore
  }
  const nav = navigator.language?.slice(0, 2).toLowerCase() ?? 'en';
  return isLocale(nav) ? nav : 'en';
}

export function useLocale() {
  const [locale, setLocaleState] = useState<LocaleCode>('en');

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    document.documentElement.setAttribute('lang', detected);
  }, []);

  const setLocale = useCallback((next: LocaleCode) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('lang', next);
    setLocaleState(next);
  }, []);

  return { locale, setLocale };
}

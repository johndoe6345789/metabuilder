/**
 * useTranslation Hook
 * Provides translation functionality for workflowui components.
 */

'use client';

import { useCallback, useMemo } from 'react';
import {
  translations,
  defaultLocale,
  type Locale,
  type TranslationKeys,
} from '@metabuilder/translations';
import {
  detectLocale,
  buildTranslator,
} from './hooks/i18nUtils';

export interface UseTranslationOptions {
  locale?: Locale;
}

export interface UseTranslationReturn {
  locale: Locale;
  t: (key: string, variables?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
  translations: TranslationKeys;
}

export function useTranslation(
  options?: UseTranslationOptions
): UseTranslationReturn {
  const locale = options?.locale ?? detectLocale();

  const currentTranslations = useMemo(
    () => translations[locale] ?? translations[defaultLocale],
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
      window.location.reload();
    }
  }, []);

  return {
    locale,
    t,
    setLocale,
    translations: currentTranslations,
  };
}

export default useTranslation;

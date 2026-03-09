/**
 * useTranslation Hook
 *
 * Provides translation functionality for workflowui components.
 * Uses @metabuilder/translations package.
 */

'use client';

import { useCallback, useMemo } from 'react';
import {
  translations,
  defaultLocale,
  isValidLocale,
  type Locale,
  type TranslationKeys,
} from '@metabuilder/translations';

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate variables in translation string
 * Supports {{variable}} syntax
 */
function interpolate(template: string, variables?: Record<string, string | number>): string {
  if (!variables) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * Get locale from browser or localStorage
 */
function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Check localStorage first
  const stored = localStorage.getItem('locale');
  if (stored && isValidLocale(stored)) {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (isValidLocale(browserLang)) {
    return browserLang;
  }

  return defaultLocale;
}

/**
 * Hook options
 */
export interface UseTranslationOptions {
  locale?: Locale;
}

/**
 * Translation hook return type
 */
export interface UseTranslationReturn {
  /** Current locale */
  locale: Locale;
  /** Translate a key */
  t: (key: string, variables?: Record<string, string | number>) => string;
  /** Change locale */
  setLocale: (locale: Locale) => void;
  /** All translations for current locale */
  translations: TranslationKeys;
}

/**
 * useTranslation hook
 *
 * @example
 * ```tsx
 * const { t, locale, setLocale } = useTranslation();
 *
 * return (
 *   <button onClick={() => setLocale('es')}>
 *     {t('common.save')} // "Save" or "Guardar"
 *   </button>
 * );
 * ```
 */
export function useTranslation(options?: UseTranslationOptions): UseTranslationReturn {
  const locale = options?.locale ?? detectLocale();

  const currentTranslations = useMemo(() => {
    return translations[locale] ?? translations[defaultLocale];
  }, [locale]);

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      const value = getNestedValue(currentTranslations as Record<string, unknown>, key);

      if (!value) {
        // Fallback to English if key not found in current locale
        const fallback = getNestedValue(translations[defaultLocale] as Record<string, unknown>, key);
        if (fallback) {
          return interpolate(fallback, variables);
        }
        // Return key if not found anywhere (helps identify missing translations)
        console.warn(`Translation missing: ${key}`);
        return key;
      }

      return interpolate(value, variables);
    },
    [currentTranslations]
  );

  const setLocale = useCallback((newLocale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      // Trigger re-render by reloading (or use context in production)
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

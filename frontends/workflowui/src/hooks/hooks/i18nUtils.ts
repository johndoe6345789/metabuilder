/**
 * i18nUtils - Pure utility functions for I18n
 */

import {
  translations,
  defaultLocale,
  isValidLocale,
  type Locale,
} from '@metabuilder/translations';

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate variables in translation string
 */
export function interpolate(
  template: string,
  variables?: Record<string, string | number>
): string {
  if (!variables) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * Detect locale from browser or localStorage
 */
export function detectLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const stored = localStorage.getItem('locale');
  if (stored && isValidLocale(stored)) return stored;
  const browserLang = navigator.language.split('-')[0];
  if (isValidLocale(browserLang)) return browserLang;
  return defaultLocale;
}

/**
 * Build a translate function for a given locale
 */
export function buildTranslator(
  currentTranslations: Record<string, unknown>
) {
  return (
    key: string,
    variables?: Record<string, string | number>
  ): string => {
    const value = getNestedValue(currentTranslations, key);
    if (!value) {
      const fallback = getNestedValue(
        translations[defaultLocale] as Record<string, unknown>,
        key
      );
      if (fallback) return interpolate(fallback, variables);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation missing: ${key}`);
      }
      return key;
    }
    return interpolate(value, variables);
  };
}

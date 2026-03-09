/**
 * Translations Index
 *
 * Exports all translation files for use across MetaBuilder.
 *
 * Usage:
 *   import { en, es, fr, supportedLocales } from '@metabuilder/translations';
 *   import type { TranslationKeys } from '@metabuilder/translations';
 */

import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import nl from './nl.json';

export { en, es, fr, nl };

/**
 * All available translations
 */
export const translations = {
  en,
  es,
  fr,
  nl,
} as const;

/**
 * Supported locale codes
 */
export const supportedLocales = ['en', 'es', 'fr', 'nl'] as const;

/**
 * Locale type
 */
export type Locale = (typeof supportedLocales)[number];

/**
 * Default locale
 */
export const defaultLocale: Locale = 'en';

/**
 * Locale display names
 */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  nl: 'Nederlands',
};

/**
 * Get translation for a locale
 */
export function getTranslation(locale: Locale) {
  return translations[locale] ?? translations[defaultLocale];
}

/**
 * Check if a locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

/**
 * Translation keys type (for type-safe access)
 */
export type TranslationKeys = typeof en;

export default translations;

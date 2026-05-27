/**
 * i18nTypes - Types for I18n context and provider
 */

import type { ReactNode } from 'react';
import type {
  Locale,
  TranslationKeys,
} from '@metabuilder/translations';

export interface I18nContextValue {
  locale: Locale;
  t: (
    key: string,
    variables?: Record<string, string | number>
  ) => string;
  setLocale: (locale: Locale) => void;
  translations: TranslationKeys;
  supportedLocales: readonly Locale[];
  localeNames: Record<Locale, string>;
}

export interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

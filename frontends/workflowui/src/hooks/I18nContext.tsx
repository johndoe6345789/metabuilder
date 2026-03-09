/**
 * I18n Context
 *
 * React context for internationalization.
 * Provides translation state across the app without page reloads.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import {
  translations,
  defaultLocale,
  isValidLocale,
  localeNames,
  supportedLocales,
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
 */
function interpolate(template: string, variables?: Record<string, string | number>): string {
  if (!variables) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * I18n context value
 */
export interface I18nContextValue {
  /** Current locale */
  locale: Locale;
  /** Translate a key */
  t: (key: string, variables?: Record<string, string | number>) => string;
  /** Change locale (no reload required) */
  setLocale: (locale: Locale) => void;
  /** All translations for current locale */
  translations: TranslationKeys;
  /** All supported locales */
  supportedLocales: readonly Locale[];
  /** Locale display names */
  localeNames: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * I18n Provider Props
 */
export interface I18nProviderProps {
  children: ReactNode;
  /** Initial locale (defaults to browser/localStorage) */
  initialLocale?: Locale;
}

/**
 * Get locale from browser or localStorage
 */
function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  const stored = localStorage.getItem('locale');
  if (stored && isValidLocale(stored)) {
    return stored;
  }

  const browserLang = navigator.language.split('-')[0];
  if (isValidLocale(browserLang)) {
    return browserLang;
  }

  return defaultLocale;
}

/**
 * I18n Provider
 *
 * Wrap your app with this provider to enable translations.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { I18nProvider } from '@/hooks/I18nContext';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <I18nProvider>
 *           {children}
 *         </I18nProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? defaultLocale);

  // Detect locale on mount (client-side only)
  useEffect(() => {
    if (!initialLocale) {
      setLocaleState(detectLocale());
    }
  }, [initialLocale]);

  const currentTranslations = useMemo(() => {
    return translations[locale] ?? translations[defaultLocale];
  }, [locale]);

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>): string => {
      const value = getNestedValue(currentTranslations as Record<string, unknown>, key);

      if (!value) {
        const fallback = getNestedValue(translations[defaultLocale] as Record<string, unknown>, key);
        if (fallback) {
          return interpolate(fallback, variables);
        }
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation missing: ${key}`);
        }
        return key;
      }

      return interpolate(value, variables);
    },
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

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * useI18n hook
 *
 * Access translation context. Must be used within I18nProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t, locale, setLocale, localeNames } = useI18n();
 *
 *   return (
 *     <div>
 *       <p>{t('common.save')}</p>
 *       <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
 *         {Object.entries(localeNames).map(([code, name]) => (
 *           <option key={code} value={code}>{name}</option>
 *         ))}
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
}

export default I18nProvider;

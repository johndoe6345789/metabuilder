/**
 * useTranslation Hook
 *
 * Provides i18n translation function `t()` that checks DBAL overrides first,
 * then falls back to static @metabuilder/translations, then returns the key.
 *
 * Data flow:
 *   1. DBAL overrides (editable via Settings → Language)
 *   2. Static @metabuilder/translations package (en/es/fr/nl)
 *   3. Raw key (fallback of last resort)
 *
 * Usage:
 *   const { t, locale, setLocale, localeOptions } = useTranslation()
 *   t('common.save')          // → "Opslaan" (if locale=nl)
 *   t('custom.key', 'Hello')  // → "Hello" (uses provided fallback)
 */

import { useCallback, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { setLocale as setLocaleAction, fetchTranslations } from '@/store/slices/translationsSlice'
import { getTranslation, supportedLocales, localeNames } from '@metabuilder/translations'
import { getNestedValue } from '@/lib/json-ui/utils'

export interface UseTranslationReturn {
  /** Translate a dot-notation key */
  t: (key: string, fallback?: string) => string
  /** Current locale code */
  locale: string
  /** Change the active locale */
  setLocale: (locale: string) => void
  /** Available locales as { value, label } pairs for dropdowns */
  localeOptions: Array<{ value: string; label: string }>
}

export function useTranslation(): UseTranslationReturn {
  const dispatch = useAppDispatch()
  const locale = useAppSelector((state) => state.translations.locale)
  const overrides = useAppSelector((state) => state.translations.overrides)

  /** Memoized static translations for the current locale */
  const staticTranslations = useMemo(() => {
    return getTranslation(locale as any)
  }, [locale])

  /**
   * Translate a dot-notation key.
   * Priority: DBAL override → static package → fallback → key
   */
  const t = useCallback(
    (key: string, fallback?: string): string => {
      // 1. Check DBAL overrides
      const override = overrides[key]
      if (override?.value) {
        return override.value
      }

      // 2. Check static translations via dot-path resolution
      const staticValue = getNestedValue(staticTranslations, key)
      if (typeof staticValue === 'string') {
        return staticValue
      }

      // 3. Fallback or raw key
      return fallback ?? key
    },
    [overrides, staticTranslations]
  )

  /** Change locale and fetch DBAL overrides for the new locale */
  const setLocale = useCallback(
    (newLocale: string) => {
      dispatch(setLocaleAction(newLocale))
      dispatch(fetchTranslations(newLocale))
    },
    [dispatch]
  )

  /** Pre-computed locale options for dropdown components */
  const localeOptions = useMemo(() => {
    return supportedLocales.map((code) => ({
      value: code,
      label: localeNames[code] || code,
    }))
  }, [])

  return { t, locale, setLocale, localeOptions }
}

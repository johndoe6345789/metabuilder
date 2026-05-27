/**
 * useTranslationRows
 *
 * Derives the flat, filterable list of TranslationRow
 * objects from the current locale + Redux overrides.
 */

import { useMemo } from 'react'
import { useAppSelector } from '@/store'
import {
  getTranslation,
} from '@metabuilder/translations'
import type { TranslationRow } from './use-translation-editor'

function flattenTranslations(
  obj: Record<string, any>,
  prefix = ''
): Array<{ key: string; value: string }> {
  const result: Array<{
    key: string
    value: string
  }> = []
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix
      ? `${prefix}.${k}`
      : k
    if (typeof v === 'string') {
      result.push({ key: fullKey, value: v })
    } else if (
      typeof v === 'object' &&
      v !== null
    ) {
      result.push(
        ...flattenTranslations(v, fullKey)
      )
    }
  }
  return result
}

export function useTranslationRows(
  filterQuery: string
) {
  const locale = useAppSelector(
    (state) => state.translations.locale
  )
  const overrides = useAppSelector(
    (state) => state.translations.overrides
  )

  const staticTranslations = useMemo(() => {
    const data = getTranslation(locale as any)
    return flattenTranslations(data)
  }, [locale])

  const rows = useMemo((): TranslationRow[] => {
    const normalized = filterQuery.toLowerCase()
    return staticTranslations
      .filter((entry) => {
        if (!normalized) return true
        return (
          entry.key
            .toLowerCase()
            .includes(normalized) ||
          entry.value
            .toLowerCase()
            .includes(normalized)
        )
      })
      .map((entry) => {
        const override = overrides[entry.key]
        return {
          key: entry.key,
          staticValue: entry.value,
          currentValue:
            override?.value ?? entry.value,
          isOverridden: !!override,
        }
      })
  }, [staticTranslations, overrides, filterQuery])

  return {
    rows,
    staticTranslations,
    overrideCount: Object.keys(overrides).length,
  }
}

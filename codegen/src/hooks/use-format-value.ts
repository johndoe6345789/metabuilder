import { useMemo } from 'react'

export function useFormatValue(
  value: any,
  format: 'text' | 'number' | 'currency' | 'date' | 'time' | 'datetime' | 'boolean' = 'text',
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return useMemo(() => {
    if (value === null || value === undefined) return ''

    switch (format) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString(locale) : value

      case 'currency':
        return typeof value === 'number'
          ? new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value)
          : value

      case 'date':
        try {
          return new Date(value).toLocaleDateString(locale)
        } catch {
          return value
        }

      case 'time':
        try {
          return new Date(value).toLocaleTimeString(locale)
        } catch {
          return value
        }

      case 'datetime':
        try {
          return new Date(value).toLocaleString(locale)
        } catch {
          return value
        }

      case 'boolean':
        return value ? 'Yes' : 'No'

      default:
        return String(value)
    }
  }, [value, format, currency, locale])
}

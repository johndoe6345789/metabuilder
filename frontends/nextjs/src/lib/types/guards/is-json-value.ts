import type { JsonValue } from '@/types/utility-types'

/**
 * Check if value is a valid JSON value
 */
export function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true
  if (typeof value === 'string') return true
  if (typeof value === 'number') return true
  if (typeof value === 'boolean') return true
  if (Array.isArray(value)) {
    return value.every(isJsonValue)
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isJsonValue)
  }
  return false
}

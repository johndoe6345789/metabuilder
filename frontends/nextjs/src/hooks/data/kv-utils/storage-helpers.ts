/**
 * @file storage-helpers.ts
 * @description Storage access and key management utilities
 */

const STORAGE_PREFIX = 'mb_kv:'

/**
 * Get localStorage if available
 */
export function getLocalStorage(): Storage | null {
  if (typeof globalThis === 'undefined') return null
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

/**
 * Get prefixed storage key
 */
export function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

/**
 * Safely parse JSON string
 */
export function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return raw
  }
}

/**
 * Safely stringify value to JSON
 */
export function safeStringify(value: unknown): string | null {
  try {
    const serialized = JSON.stringify(value)
    return typeof serialized === 'string' ? serialized : null
  } catch {
    return null
  }
}

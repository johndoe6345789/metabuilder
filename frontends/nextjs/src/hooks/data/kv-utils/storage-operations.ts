/**
 * @file storage-operations.ts
 * @description KV storage read/write operations
 */

import { kvStore } from './kv-store'
import { getLocalStorage, getStorageKey, safeParse, safeStringify } from './storage-helpers'

/**
 * Read stored value with migration support
 */
export function readStoredValue<T>(key: string): T | undefined {
  if (kvStore.has(key)) {
    return kvStore.get(key) as T | undefined
  }

  const storage = getLocalStorage()
  if (!storage) return undefined

  const storageKey = getStorageKey(key)
  const raw = storage.getItem(storageKey)
  if (raw !== null) {
    const parsed = safeParse(raw)
    kvStore.set(key, parsed)
    return parsed as T
  }

  // Legacy migration
  const legacyRaw = storage.getItem(key)
  if (legacyRaw === null) return undefined

  const parsedLegacy = safeParse(legacyRaw)
  kvStore.set(key, parsedLegacy)

  const serialized = safeStringify(parsedLegacy)
  if (serialized !== null) {
    try {
      storage.setItem(storageKey, serialized)
      storage.removeItem(key)
    } catch (error) {
      console.error('Error migrating legacy KV value:', error)
    }
  }

  return parsedLegacy as T
}

/**
 * Write value to storage
 */
export function writeStoredValue(key: string, value: unknown): void {
  kvStore.set(key, value)
  
  const storage = getLocalStorage()
  if (!storage) return

  const storageKey = getStorageKey(key)
  const serialized = safeStringify(value)
  
  if (serialized !== null) {
    try {
      storage.setItem(storageKey, serialized)
    } catch (error) {
      console.error('Error writing KV value:', error)
    }
  }
}

/**
 * Delete value from storage
 */
export function deleteStoredValue(key: string): void {
  kvStore.delete(key)
  
  const storage = getLocalStorage()
  if (!storage) return

  const storageKey = getStorageKey(key)
  try {
    storage.removeItem(storageKey)
    storage.removeItem(key) // Also remove legacy key
  } catch (error) {
    console.error('Error deleting KV value:', error)
  }
}

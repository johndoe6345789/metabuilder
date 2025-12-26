/**
 * Custom useKV hook - replacement for @github/spark/hooks
 * Uses in-memory storage with localStorage persistence in the browser
 * API compatible with @github/spark/hooks
 */
import { useState, useEffect, useCallback, useRef } from 'react'

type Subscriber = (value: unknown) => void

const STORAGE_PREFIX = 'mb_kv:'

const kvStore = new Map<string, unknown>()
const kvSubscribers = new Map<string, Set<Subscriber>>()
let storageListenerRegistered = false

function getLocalStorage(): Storage | null {
  if (typeof globalThis === 'undefined') return null
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return raw
  }
}

function safeStringify(value: unknown): string | null {
  try {
    const serialized = JSON.stringify(value)
    return typeof serialized === 'string' ? serialized : null
  } catch {
    return null
  }
}

function readStoredValue<T>(key: string): T | undefined {
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

function writeStoredValue<T>(key: string, value: T | undefined): void {
  const storage = getLocalStorage()
  const storageKey = getStorageKey(key)

  if (value === undefined) {
    kvStore.delete(key)
    storage?.removeItem(storageKey)
    storage?.removeItem(key)
    notifySubscribers(key, value)
    return
  }

  kvStore.set(key, value)
  if (!storage) {
    notifySubscribers(key, value)
    return
  }

  const serialized = safeStringify(value)
  if (serialized === null) {
    console.error('Error serializing KV value for storage:', key)
    notifySubscribers(key, value)
    return
  }

  try {
    storage.setItem(storageKey, serialized)
    storage.removeItem(key)
  } catch (error) {
    console.error('Error persisting KV value:', error)
  }

  notifySubscribers(key, value)
}

function notifySubscribers(key: string, value: unknown): void {
  const subscribers = kvSubscribers.get(key)
  if (!subscribers) return
  for (const subscriber of subscribers) {
    subscriber(value)
  }
}

function subscribeToKey(key: string, subscriber: Subscriber): () => void {
  const subscribers = kvSubscribers.get(key) ?? new Set<Subscriber>()
  subscribers.add(subscriber)
  kvSubscribers.set(key, subscribers)

  return () => {
    subscribers.delete(subscriber)
    if (subscribers.size === 0) {
      kvSubscribers.delete(key)
    }
  }
}

function resolveStorageKey(storageKey: string): string | null {
  if (storageKey.startsWith(STORAGE_PREFIX)) {
    return storageKey.slice(STORAGE_PREFIX.length)
  }
  if (kvSubscribers.has(storageKey)) {
    return storageKey
  }
  return null
}

function ensureStorageListener(): void {
  if (storageListenerRegistered) return
  const storage = getLocalStorage()
  if (!storage) return
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return

  window.addEventListener('storage', (event: StorageEvent) => {
    if (!event.key) return
    if (event.storageArea && event.storageArea !== storage) return
    const resolvedKey = resolveStorageKey(event.key)
    if (!resolvedKey) return

    const nextValue = event.newValue === null ? undefined : safeParse(event.newValue)
    if (nextValue === undefined) {
      kvStore.delete(resolvedKey)
    } else {
      kvStore.set(resolvedKey, nextValue)
    }
    notifySubscribers(resolvedKey, nextValue)
  })

  storageListenerRegistered = true
}

export function useKV<T = any>(key: string, defaultValue?: T): [T | undefined, (newValueOrUpdater: T | ((prev: T | undefined) => T)) => Promise<void>] {
  const [value, setValue] = useState<T | undefined>(() => {
    const storedValue = readStoredValue<T>(key)
    return storedValue !== undefined ? storedValue : defaultValue
  })
  const valueRef = useRef<T | undefined>(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    ensureStorageListener()

    const unsubscribe = subscribeToKey(key, (nextValue) => {
      setValue(nextValue as T | undefined)
    })

    try {
      const storedValue = readStoredValue<T>(key)
      if (storedValue !== undefined) {
        setValue(storedValue)
      } else if (defaultValue !== undefined) {
        writeStoredValue(key, defaultValue)
        setValue(defaultValue)
      }
    } catch (err) {
      console.error('Error loading KV value:', err)
    }

    return () => {
      unsubscribe()
    }
  }, [key, defaultValue])

  // Update value in KV store
  const updateValue = useCallback(async (newValueOrUpdater: T | ((prev: T | undefined) => T)) => {
    try {
      // Handle updater function
      const currentValue = kvStore.has(key) ? (kvStore.get(key) as T | undefined) : valueRef.current
      const newValue = typeof newValueOrUpdater === 'function' 
        ? (newValueOrUpdater as (prev: T | undefined) => T)(currentValue)
        : newValueOrUpdater

      writeStoredValue(key, newValue)
      setValue(newValue)
    } catch (err) {
      console.error('Error saving KV value:', err)
    }
  }, [key])

  return [value, updateValue]
}

// Alias for compatibility
export { useKV as default }

/**
 * Custom useKV hook - replacement for @github/spark/hooks
 * Uses our Database KV store implementation
 * API compatible with @github/spark/hooks
 */
import { useState, useEffect, useCallback } from 'react'

type Subscriber = (value: unknown) => void

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

function safeParse(raw: string): unknown | undefined {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return undefined
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

  const raw = storage.getItem(key)
  if (raw === null) return undefined

  const parsed = safeParse(raw)
  if (parsed === undefined) {
    storage.removeItem(key)
    return undefined
  }

  kvStore.set(key, parsed)
  return parsed as T
}

function writeStoredValue<T>(key: string, value: T | undefined): void {
  const storage = getLocalStorage()

  if (value === undefined) {
    kvStore.delete(key)
    storage?.removeItem(key)
    return
  }

  kvStore.set(key, value)
  if (!storage) return

  const serialized = safeStringify(value)
  if (serialized === null) {
    console.error('Error serializing KV value for storage:', key)
    return
  }

  try {
    storage.setItem(key, serialized)
  } catch (error) {
    console.error('Error persisting KV value:', error)
  }
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

function ensureStorageListener(): void {
  if (storageListenerRegistered) return
  const storage = getLocalStorage()
  if (!storage) return
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return

  window.addEventListener('storage', (event: StorageEvent) => {
    if (!event.key) return
    if (event.storageArea && event.storageArea !== storage) return

    const nextValue = event.newValue ? safeParse(event.newValue) : undefined
    if (nextValue === undefined) {
      kvStore.delete(event.key)
    } else {
      kvStore.set(event.key, nextValue)
    }
    notifySubscribers(event.key, nextValue)
  })

  storageListenerRegistered = true
}

export function useKV<T = any>(key: string, defaultValue?: T): [T | undefined, (newValueOrUpdater: T | ((prev: T | undefined) => T)) => Promise<void>] {
  const [value, setValue] = useState<T | undefined>(defaultValue)

  // Load initial value
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
      const currentValue = kvStore.has(key) ? (kvStore.get(key) as T | undefined) : value
      const newValue = typeof newValueOrUpdater === 'function' 
        ? (newValueOrUpdater as (prev: T | undefined) => T)(currentValue)
        : newValueOrUpdater

      writeStoredValue(key, newValue)
      setValue(newValue)
      notifySubscribers(key, newValue)
    } catch (err) {
      console.error('Error saving KV value:', err)
    }
  }, [key, value])

  return [value, updateValue]
}

// Alias for compatibility
export { useKV as default }

/**
 * Custom useKV hook - replacement for @github/spark/hooks
 * Uses our Database KV store implementation
 * API compatible with @github/spark/hooks
 */
import { useState, useEffect, useCallback } from 'react'

// Simple in-memory KV store for now
// TODO: Implement proper persistent KV storage with Database/Prisma
const kvStore = new Map<string, any>()

export function useKV<T = any>(key: string, defaultValue?: T): [T | undefined, (newValueOrUpdater: T | ((prev: T | undefined) => T)) => Promise<void>] {
  const [value, setValue] = useState<T | undefined>(defaultValue)

  // Load initial value
  useEffect(() => {
    const loadValue = async () => {
      try {
        const storedValue = kvStore.get(key)
        if (storedValue !== undefined) {
          setValue(storedValue as T)
        } else if (defaultValue !== undefined) {
          setValue(defaultValue)
          kvStore.set(key, defaultValue)
        }
      } catch (err) {
        console.error('Error loading KV value:', err)
      }
    }

    loadValue()
  }, [key, defaultValue])

  // Update value in KV store
  const updateValue = useCallback(async (newValueOrUpdater: T | ((prev: T | undefined) => T)) => {
    try {
      // Handle updater function
      const newValue = typeof newValueOrUpdater === 'function' 
        ? (newValueOrUpdater as (prev: T | undefined) => T)(value)
        : newValueOrUpdater

      kvStore.set(key, newValue)
      setValue(newValue)
    } catch (err) {
      console.error('Error saving KV value:', err)
    }
  }, [key, value])

  return [value, updateValue]
}

// Alias for compatibility
export { useKV as default }

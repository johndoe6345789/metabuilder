import { useState, useEffect, useCallback } from 'react'
import { storage } from '@/lib/storage'

export function useStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, () => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    storage
      .get<T>(key)
      .then((storedValue) => {
        if (mounted) {
          if (storedValue !== undefined) {
            setValue(storedValue)
          }
          setIsInitialized(true)
        }
      })
      .catch((error) => {
        console.error(`Error loading ${key}:`, error)
        if (mounted) {
          setIsInitialized(true)
        }
      })

    return () => {
      mounted = false
    }
  }, [key])

  const updateValue = useCallback(
    async (newValueOrUpdater: T | ((prev: T) => T)) => {
      const newValue =
        typeof newValueOrUpdater === 'function'
          ? (newValueOrUpdater as (prev: T) => T)(value)
          : newValueOrUpdater

      setValue(newValue)

      try {
        await storage.set(key, newValue)
      } catch (error) {
        console.error(`Error saving ${key}:`, error)
        throw error
      }
    },
    [key, value]
  )

  const deleteValue = useCallback(async () => {
    setValue(defaultValue)

    try {
      await storage.delete(key)
    } catch (error) {
      console.error(`Error deleting ${key}:`, error)
      throw error
    }
  }, [key, defaultValue])

  return [isInitialized ? value : defaultValue, updateValue, deleteValue]
}

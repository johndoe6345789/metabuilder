import { useState, useEffect, useCallback } from 'react'
import { unifiedStorage } from '@/lib/unified-storage'

export function useUnifiedStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, () => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadValue = async () => {
      try {
        const stored = await unifiedStorage.get<T>(key)
        if (mounted) {
          setValue(stored !== undefined ? stored : defaultValue)
        }
      } catch (error) {
        console.error(`Failed to load ${key}:`, error)
        if (mounted) {
          setValue(defaultValue)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadValue()

    return () => {
      mounted = false
    }
  }, [key, defaultValue])

  const updateValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      try {
        const valueToSet = typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(value)
          : newValue

        setValue(valueToSet)
        await unifiedStorage.set(key, valueToSet)
      } catch (error) {
        console.error(`Failed to save ${key}:`, error)
        throw error
      }
    },
    [key, value]
  )

  const deleteValue = useCallback(async () => {
    try {
      setValue(defaultValue)
      await unifiedStorage.delete(key)
    } catch (error) {
      console.error(`Failed to delete ${key}:`, error)
      throw error
    }
  }, [key, defaultValue])

  return [value, updateValue, deleteValue]
}

export function useStorageBackend() {
  const [backend, setBackend] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const detectBackend = async () => {
      try {
        const currentBackend = await unifiedStorage.getBackend()
        if (mounted) {
          setBackend(currentBackend)
        }
      } catch (error) {
        console.error('Failed to detect storage backend:', error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    detectBackend()

    return () => {
      mounted = false
    }
  }, [])

  const switchToFlask = useCallback(async (backendUrl?: string) => {
    setIsLoading(true)
    try {
      await unifiedStorage.switchToFlask(backendUrl)
      setBackend('flask')
    } catch (error) {
      console.error('Failed to switch to Flask:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const switchToIndexedDB = useCallback(async () => {
    setIsLoading(true)
    try {
      await unifiedStorage.switchToIndexedDB()
      setBackend('indexeddb')
    } catch (error) {
      console.error('Failed to switch to IndexedDB:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const switchToSQLite = useCallback(async () => {
    setIsLoading(true)
    try {
      await unifiedStorage.switchToSQLite()
      setBackend('sqlite')
    } catch (error) {
      console.error('Failed to switch to SQLite:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const exportData = useCallback(async () => {
    try {
      return await unifiedStorage.exportData()
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }, [])

  const importData = useCallback(async (data: Record<string, any>) => {
    setIsLoading(true)
    try {
      await unifiedStorage.importData(data)
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    backend,
    isLoading,
    switchToFlask,
    switchToIndexedDB,
    switchToSQLite,
    exportData,
    importData,
  }
}

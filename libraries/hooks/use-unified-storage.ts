import { useState, useEffect, useCallback } from 'react'

/**
 * Storage backend types supported by the unified storage system
 */
export type StorageBackendType = 'indexeddb' | 'sqlite' | 'flask' | 'memory'

/**
 * Interface for storage backend implementations
 */
export interface StorageBackendAdapter {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<void>
  getBackend(): Promise<StorageBackendType>
  switchToFlask(backendUrl?: string): Promise<void>
  switchToIndexedDB(): Promise<void>
  switchToSQLite(): Promise<void>
  exportData(): Promise<Record<string, unknown>>
  importData(data: Record<string, unknown>): Promise<void>
}

/**
 * Default no-op storage adapter for environments where storage is not configured.
 * This prevents errors when the hook is used before a real adapter is provided.
 */
const defaultStorageAdapter: StorageBackendAdapter = {
  async get<T>(): Promise<T | undefined> {
    return undefined
  },
  async set(): Promise<void> {
    // no-op
  },
  async delete(): Promise<void> {
    // no-op
  },
  async getBackend(): Promise<StorageBackendType> {
    return 'memory'
  },
  async switchToFlask(): Promise<void> {
    console.warn('Storage adapter not configured: switchToFlask')
  },
  async switchToIndexedDB(): Promise<void> {
    console.warn('Storage adapter not configured: switchToIndexedDB')
  },
  async switchToSQLite(): Promise<void> {
    console.warn('Storage adapter not configured: switchToSQLite')
  },
  async exportData(): Promise<Record<string, unknown>> {
    return {}
  },
  async importData(): Promise<void> {
    console.warn('Storage adapter not configured: importData')
  },
}

// Global storage adapter - can be configured by consumers
let storageAdapter: StorageBackendAdapter = defaultStorageAdapter

/**
 * Configure the storage adapter for the application.
 * Call this once during app initialization before using storage hooks.
 *
 * @param adapter - The storage backend adapter to use
 */
export function configureStorageAdapter(adapter: StorageBackendAdapter): void {
  storageAdapter = adapter
}

/**
 * Get the current storage adapter
 */
export function getStorageAdapter(): StorageBackendAdapter {
  return storageAdapter
}

/**
 * Hook for reading and writing individual values to unified storage.
 *
 * @param key - The storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue, deleteValue]
 */
export function useUnifiedStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, () => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue)
  const [, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadValue = async () => {
      try {
        const stored = await storageAdapter.get<T>(key)
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
        const valueToSet =
          typeof newValue === 'function' ? (newValue as (prev: T) => T)(value) : newValue

        setValue(valueToSet)
        await storageAdapter.set(key, valueToSet)
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
      await storageAdapter.delete(key)
    } catch (error) {
      console.error(`Failed to delete ${key}:`, error)
      throw error
    }
  }, [key, defaultValue])

  return [value, updateValue, deleteValue]
}

/**
 * Hook for managing the storage backend selection and data operations.
 * Provides methods to switch between backends and import/export data.
 */
export function useStorageBackend() {
  const [backend, setBackend] = useState<StorageBackendType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const detectBackend = async () => {
      try {
        const currentBackend = await storageAdapter.getBackend()
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
      await storageAdapter.switchToFlask(backendUrl)
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
      await storageAdapter.switchToIndexedDB()
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
      await storageAdapter.switchToSQLite()
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
      return await storageAdapter.exportData()
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }, [])

  const importData = useCallback(async (data: Record<string, unknown>) => {
    setIsLoading(true)
    try {
      await storageAdapter.importData(data)
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

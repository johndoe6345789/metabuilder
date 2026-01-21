import { storageAdapter } from './storage-adapter'

class HybridStorage {
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await storageAdapter.get<T>(key)
    } catch (error) {
      console.error(`[Storage] Error getting key ${key}:`, error)
      return undefined
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await storageAdapter.set(key, value)
    } catch (error) {
      console.error(`[Storage] Error setting key ${key}:`, error)
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await storageAdapter.delete(key)
    } catch (error) {
      console.error(`[Storage] Error deleting key ${key}:`, error)
      throw error
    }
  }

  async keys(): Promise<string[]> {
    try {
      return await storageAdapter.keys()
    } catch (error) {
      console.error('[Storage] Error getting keys:', error)
      return []
    }
  }

  async clear(): Promise<void> {
    try {
      await storageAdapter.clear()
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error)
      throw error
    }
  }

  getBackendType(): 'flask' | 'indexeddb' | null {
    return storageAdapter.getBackendType()
  }

  async migrateToFlask(flaskUrl: string): Promise<number> {
    return await storageAdapter.migrateToFlask(flaskUrl)
  }

  async migrateToIndexedDB(): Promise<number> {
    return await storageAdapter.migrateToIndexedDB()
  }
}

export const storage = new HybridStorage()

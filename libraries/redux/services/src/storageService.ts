/**
 * Storage Service - Unified storage interface with IndexedDB and REST API support
 *
 * This service provides a unified storage interface that:
 * - Uses IndexedDB by default (browser-native, persistent storage)
 * - Optionally uses REST API backend when configured
 * - Automatically falls back to IndexedDB if REST API fails
 */

const DEFAULT_DB_NAME = 'metabuilder-storage';
const DEFAULT_DB_VERSION = 1;
const DEFAULT_STORE_NAME = 'kv-store';

export interface StorageBackend {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
  clear(): Promise<void>;
}

export interface IndexedDBStorageConfig {
  dbName?: string;
  dbVersion?: number;
  storeName?: string;
}

export class IndexedDBStorage implements StorageBackend {
  private dbPromise: Promise<IDBDatabase>;
  private dbName: string;
  private dbVersion: number;
  private storeName: string;

  constructor(config: IndexedDBStorageConfig = {}) {
    this.dbName = config.dbName || DEFAULT_DB_NAME;
    this.dbVersion = config.dbVersion || DEFAULT_DB_VERSION;
    this.storeName = config.storeName || DEFAULT_STORE_NAME;
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return undefined;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB delete error:', error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB keys error:', error);
      return [];
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB clear error:', error);
      throw error;
    }
  }
}

export interface RESTAPIStorageConfig {
  baseURL: string;
  fallbackToIndexedDB?: boolean;
  indexedDBConfig?: IndexedDBStorageConfig;
}

export class RESTAPIStorage implements StorageBackend {
  private baseURL: string;
  private fallbackStorage: IndexedDBStorage | null;
  private useFallback: boolean;

  constructor(config: RESTAPIStorageConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, '');
    this.useFallback = config.fallbackToIndexedDB !== false;
    this.fallbackStorage = this.useFallback
      ? new IndexedDBStorage(config.indexedDBConfig)
      : null;
  }

  private async fetchWithFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.fallbackStorage) {
        console.warn('REST API failed, falling back to IndexedDB:', error);
        return fallbackOperation();
      }
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    const restOperation = async () => {
      const response = await fetch(
        `${this.baseURL}/api/storage/${encodeURIComponent(key)}`
      );
      if (!response.ok) {
        if (response.status === 404) return undefined;
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.value as T;
    };

    if (this.fallbackStorage) {
      return this.fetchWithFallback(restOperation, () =>
        this.fallbackStorage!.get<T>(key)
      );
    }

    return restOperation();
  }

  async set(key: string, value: unknown): Promise<void> {
    const restOperation = async () => {
      const response = await fetch(
        `${this.baseURL}/api/storage/${encodeURIComponent(key)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    };

    if (this.fallbackStorage) {
      return this.fetchWithFallback(restOperation, () =>
        this.fallbackStorage!.set(key, value)
      );
    }

    return restOperation();
  }

  async delete(key: string): Promise<void> {
    const restOperation = async () => {
      const response = await fetch(
        `${this.baseURL}/api/storage/${encodeURIComponent(key)}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    };

    if (this.fallbackStorage) {
      return this.fetchWithFallback(restOperation, () =>
        this.fallbackStorage!.delete(key)
      );
    }

    return restOperation();
  }

  async keys(): Promise<string[]> {
    const restOperation = async () => {
      const response = await fetch(`${this.baseURL}/api/storage/keys`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.keys;
    };

    if (this.fallbackStorage) {
      return this.fetchWithFallback(restOperation, () =>
        this.fallbackStorage!.keys()
      );
    }

    return restOperation();
  }

  async clear(): Promise<void> {
    const restOperation = async () => {
      const response = await fetch(`${this.baseURL}/api/storage`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    };

    if (this.fallbackStorage) {
      return this.fetchWithFallback(restOperation, () =>
        this.fallbackStorage!.clear()
      );
    }

    return restOperation();
  }
}

export interface StorageServiceConfig {
  useRestAPI?: boolean;
  restAPIURL?: string;
  indexedDBConfig?: IndexedDBStorageConfig;
}

/**
 * Create a storage service instance based on configuration
 */
export function createStorageService(
  config: StorageServiceConfig = {}
): StorageBackend {
  if (config.useRestAPI && config.restAPIURL) {
    return new RESTAPIStorage({
      baseURL: config.restAPIURL,
      fallbackToIndexedDB: true,
      indexedDBConfig: config.indexedDBConfig,
    });
  }

  return new IndexedDBStorage(config.indexedDBConfig);
}

// Default singleton instance
let defaultStorageInstance: StorageBackend | null = null;

/**
 * Get the default storage service instance
 */
export function getDefaultStorage(): StorageBackend {
  if (!defaultStorageInstance) {
    defaultStorageInstance = new IndexedDBStorage();
  }
  return defaultStorageInstance;
}

/**
 * Configure and replace the default storage instance
 */
export function configureDefaultStorage(
  config: StorageServiceConfig
): StorageBackend {
  defaultStorageInstance = createStorageService(config);
  return defaultStorageInstance;
}

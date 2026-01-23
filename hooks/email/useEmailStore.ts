import { useCallback, useEffect, useState } from 'react'

/**
 * Email message for IndexedDB storage
 */
export interface StoredMessage {
  id: string
  messageId: string
  from: string
  to: string[]
  subject: string
  body: string
  receivedAt: number
  isRead: boolean
  isStarred: boolean
  folderName: string
  createdAt: number
}

/**
 * Hook for IndexedDB wrapper for offline email storage
 * Manages local caching of email messages
 */
export interface UseEmailStoreResult {
  /** Retrieve all stored messages */
  getMessages: (folderName?: string) => Promise<StoredMessage[]>
  /** Save messages to offline storage */
  saveMessages: (messages: StoredMessage[]) => Promise<void>
  /** Clear all stored messages */
  clear: () => Promise<void>
  /** Whether storage is initialized */
  isReady: boolean
  /** Error if initialization failed */
  error: Error | null
}

const DB_NAME = 'metabuilder_email'
const STORE_NAME = 'messages'
const DB_VERSION = 1

/**
 * IndexedDB wrapper for offline email storage
 * @returns Email store interface
 */
export function useEmailStore(): UseEmailStoreResult {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [db, setDb] = useState<IDBDatabase | null>(null)

  /**
   * Initialize IndexedDB connection
   */
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
          const err = new Error('Failed to open IndexedDB')
          setError(err)
          console.error(err)
        }

        request.onsuccess = () => {
          const database = request.result

          // Create object store if needed
          if (database.objectStoreNames.length === 0) {
            database.close()
            const createRequest = indexedDB.open(DB_NAME, DB_VERSION + 1)
            createRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
              const db = (event.target as IDBOpenDBRequest).result
              if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' })
              }
            }
            createRequest.onsuccess = () => {
              setDb(createRequest.result)
              setIsReady(true)
            }
          } else {
            setDb(database)
            setIsReady(true)
          }
        }

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const database = (event.target as IDBOpenDBRequest).result
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME, { keyPath: 'id' })
          }
        }
      } catch (err) {
        const initError = err instanceof Error ? err : new Error('Failed to initialize storage')
        setError(initError)
      }
    }

    initDB()

    return () => {
      db?.close()
    }
  }, [])

  /**
   * Retrieve messages from storage
   */
  const getMessages = useCallback(
    async (folderName?: string): Promise<StoredMessage[]> => {
      if (!db) return []

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
          const messages = request.result as StoredMessage[]
          const filtered = folderName
            ? messages.filter(m => m.folderName === folderName)
            : messages
          resolve(filtered)
        }

        request.onerror = () => {
          reject(new Error('Failed to retrieve messages'))
        }
      })
    },
    [db]
  )

  /**
   * Save messages to storage
   */
  const saveMessages = useCallback(
    async (messages: StoredMessage[]): Promise<void> => {
      if (!db) return

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite')
        const store = transaction.objectStore(STORE_NAME)

        messages.forEach(message => {
          store.put({ ...message, createdAt: Date.now() })
        })

        transaction.oncomplete = () => {
          resolve()
        }

        transaction.onerror = () => {
          reject(new Error('Failed to save messages'))
        }
      })
    },
    [db]
  )

  /**
   * Clear all stored messages
   */
  const clear = useCallback(async (): Promise<void> => {
    if (!db) return

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('Failed to clear storage'))
      }
    })
  }, [db])

  return {
    getMessages,
    saveMessages,
    clear,
    isReady,
    error,
  }
}

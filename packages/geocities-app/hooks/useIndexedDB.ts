import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'GeoCitiesDB';
const DB_VERSION = 1;

interface DBSchema {
  visitors: { id: string; count: number };
  guestbook: { id: string; name: string; message: string; date: string; email?: string };
  settings: { id: string; value: unknown };
}

type StoreName = keyof DBSchema;

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('visitors')) {
        db.createObjectStore('visitors', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('guestbook')) {
        const guestbookStore = db.createObjectStore('guestbook', { keyPath: 'id' });
        guestbookStore.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };
  });

  return dbPromise;
};

export function useIndexedDB<T extends StoreName>(storeName: T) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    openDB().then(() => setIsReady(true)).catch(console.error);
  }, []);

  const getItem = useCallback(async <K extends string>(key: K): Promise<DBSchema[T] | undefined> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [storeName]);

  const setItem = useCallback(async (value: DBSchema[T]): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, [storeName]);

  const getAllItems = useCallback(async (): Promise<DBSchema[T][]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [storeName]);

  const deleteItem = useCallback(async (key: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, [storeName]);

  return { getItem, setItem, getAllItems, deleteItem, isReady };
}

/**
 * IndexedDB namespace operations
 */

import type { Namespace } from './types'
import { openDB, NAMESPACES_STORE } from './indexeddb-core'

export async function getAllNamespaces(): Promise<Namespace[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([NAMESPACES_STORE], 'readonly')
    const store = tx.objectStore(NAMESPACES_STORE)
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getNamespace(id: string): Promise<Namespace | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([NAMESPACES_STORE], 'readonly')
    const store = tx.objectStore(NAMESPACES_STORE)
    const request = store.get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

export async function createNamespace(namespace: Namespace): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([NAMESPACES_STORE], 'readwrite')
    const store = tx.objectStore(NAMESPACES_STORE)
    const request = store.add(namespace)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function updateNamespace(namespace: Namespace): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([NAMESPACES_STORE], 'readwrite')
    const store = tx.objectStore(NAMESPACES_STORE)
    const request = store.put(namespace)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function deleteNamespace(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([NAMESPACES_STORE], 'readwrite')
    const store = tx.objectStore(NAMESPACES_STORE)
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

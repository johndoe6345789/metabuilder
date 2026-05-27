/**
 * IndexedDB snippet operations
 */

import type { Snippet } from './types'
import {
  openDB,
  SNIPPETS_STORE,
} from './indexeddb-core.js'

export async function getAllSnippets(): Promise<Snippet[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPETS_STORE], 'readonly')
    const store = tx.objectStore(SNIPPETS_STORE)
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getSnippet(id: string): Promise<Snippet | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPETS_STORE], 'readonly')
    const store = tx.objectStore(SNIPPETS_STORE)
    const request = store.get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || null)
  })
}

export async function createSnippet(snippet: Snippet): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPETS_STORE], 'readwrite')
    const store = tx.objectStore(SNIPPETS_STORE)
    const request = store.add(snippet)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function updateSnippet(snippet: Snippet): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPETS_STORE], 'readwrite')
    const store = tx.objectStore(SNIPPETS_STORE)
    const request = store.put(snippet)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function deleteSnippet(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPETS_STORE], 'readwrite')
    const store = tx.objectStore(SNIPPETS_STORE)
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getSnippetsByNamespace(
  namespaceId: string
): Promise<Snippet[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPETS_STORE], 'readonly')
    const store = tx.objectStore(SNIPPETS_STORE)
    const index = store.index('namespaceId')
    const request = index.getAll(namespaceId)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

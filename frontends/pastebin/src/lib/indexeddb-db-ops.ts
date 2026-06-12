/**
 * IndexedDB database-level operations (clear, stats, import/export)
 */

import type { Snippet, Namespace } from './types'
import { openDB, SNIPPETS_STORE, NAMESPACES_STORE } from './indexeddb-core.js'
import { getAllSnippets } from './indexeddb-snippets.js'
import { getAllNamespaces } from './indexeddb-namespaces.js'

export async function clearDatabase(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPETS_STORE, NAMESPACES_STORE], 'readwrite')
    tx.objectStore(SNIPPETS_STORE).clear()
    tx.objectStore(NAMESPACES_STORE).clear()
    tx.onerror = () => reject(tx.error)
    tx.oncomplete = () => resolve()
  })
}

export async function getDatabaseStats() {
  const snippets = await getAllSnippets()
  const namespaces = await getAllNamespaces()
  return {
    snippetCount: snippets.length,
    templateCount: snippets.filter(s => s.isTemplate).length,
    namespaceCount: namespaces.length,
    storageType: 'indexeddb' as const,
    databaseSize: 0,
  }
}

export async function exportDatabase(): Promise<{
  snippets: Snippet[]
  namespaces: Namespace[]
}> {
  return {
    snippets: await getAllSnippets(),
    namespaces: await getAllNamespaces(),
  }
}

export async function importDatabase(data: {
  snippets: Snippet[]
  namespaces: Namespace[]
}): Promise<void> {
  await clearDatabase()
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPETS_STORE, NAMESPACES_STORE], 'readwrite')
    const snippetsStore = tx.objectStore(SNIPPETS_STORE)
    const namespacesStore = tx.objectStore(NAMESPACES_STORE)
    for (const ns of data.namespaces) namespacesStore.add(ns)
    for (const s of data.snippets) snippetsStore.add(s)
    tx.onerror = () => reject(tx.error)
    tx.oncomplete = () => resolve()
  })
}

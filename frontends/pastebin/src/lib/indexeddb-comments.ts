/**
 * IndexedDB comment operations
 */

import type { SnippetComment, ProfileComment } from './types'
import {
  openDB,
  SNIPPET_COMMENTS_STORE,
  PROFILE_COMMENTS_STORE,
} from './indexeddb-core'

export async function getSnippetComments(
  snippetId: string,
): Promise<SnippetComment[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPET_COMMENTS_STORE], 'readonly')
    const store = tx.objectStore(SNIPPET_COMMENTS_STORE)
    const index = store.index('snippetId')
    const request = index.getAll(snippetId)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const results = request.result as SnippetComment[]
      results.sort((a, b) => a.createdAt - b.createdAt)
      resolve(results)
    }
  })
}

export async function createSnippetComment(
  comment: SnippetComment,
): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPET_COMMENTS_STORE], 'readwrite')
    const store = tx.objectStore(SNIPPET_COMMENTS_STORE)
    const request = store.add(comment)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getProfileComments(
  profileUserId: string,
): Promise<ProfileComment[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([PROFILE_COMMENTS_STORE], 'readonly')
    const store = tx.objectStore(PROFILE_COMMENTS_STORE)
    const index = store.index('profileUserId')
    const request = index.getAll(profileUserId)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const results = request.result as ProfileComment[]
      results.sort((a, b) => a.createdAt - b.createdAt)
      resolve(results)
    }
  })
}

export async function createProfileComment(
  comment: ProfileComment,
): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([PROFILE_COMMENTS_STORE], 'readwrite')
    const store = tx.objectStore(PROFILE_COMMENTS_STORE)
    const request = store.add(comment)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

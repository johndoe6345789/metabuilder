/**
 * IndexedDB Storage - Direct storage of snippets and namespaces
 */

import type { Snippet, Namespace, SnippetComment, ProfileComment } from './types';

const DB_NAME = 'codesnippet-db';
const DB_VERSION = 3;
const SNIPPETS_STORE = 'snippets';
const NAMESPACES_STORE = 'namespaces';
const SNIPPET_COMMENTS_STORE = 'snippetComments';
const PROFILE_COMMENTS_STORE = 'profileComments';

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create snippets store if it doesn't exist
      if (!db.objectStoreNames.contains(SNIPPETS_STORE)) {
        const snippetsStore = db.createObjectStore(SNIPPETS_STORE, { keyPath: 'id' });
        snippetsStore.createIndex('namespaceId', 'namespaceId', { unique: false });
        snippetsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create namespaces store if it doesn't exist
      if (!db.objectStoreNames.contains(NAMESPACES_STORE)) {
        db.createObjectStore(NAMESPACES_STORE, { keyPath: 'id' });
      }

      // Create comment stores if they don't exist
      if (!db.objectStoreNames.contains(SNIPPET_COMMENTS_STORE)) {
        const commentStore = db.createObjectStore(SNIPPET_COMMENTS_STORE, { keyPath: 'id' });
        commentStore.createIndex('snippetId', 'snippetId', { unique: false });
        commentStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(PROFILE_COMMENTS_STORE)) {
        const profileCommentStore = db.createObjectStore(PROFILE_COMMENTS_STORE, { keyPath: 'id' });
        profileCommentStore.createIndex('profileUserId', 'profileUserId', { unique: false });
        profileCommentStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
  });
}

// Snippet operations
export async function getAllSnippets(): Promise<Snippet[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SNIPPETS_STORE], 'readonly');
    const store = transaction.objectStore(SNIPPETS_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getSnippet(id: string): Promise<Snippet | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SNIPPETS_STORE], 'readonly');
    const store = transaction.objectStore(SNIPPETS_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function createSnippet(snippet: Snippet): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SNIPPETS_STORE], 'readwrite');
    const store = transaction.objectStore(SNIPPETS_STORE);
    const request = store.add(snippet);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateSnippet(snippet: Snippet): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SNIPPETS_STORE], 'readwrite');
    const store = transaction.objectStore(SNIPPETS_STORE);
    const request = store.put(snippet);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteSnippet(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SNIPPETS_STORE], 'readwrite');
    const store = transaction.objectStore(SNIPPETS_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSnippetsByNamespace(namespaceId: string): Promise<Snippet[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SNIPPETS_STORE], 'readonly');
    const store = transaction.objectStore(SNIPPETS_STORE);
    const index = store.index('namespaceId');
    const request = index.getAll(namespaceId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Namespace operations
export async function getAllNamespaces(): Promise<Namespace[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NAMESPACES_STORE], 'readonly');
    const store = transaction.objectStore(NAMESPACES_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getNamespace(id: string): Promise<Namespace | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NAMESPACES_STORE], 'readonly');
    const store = transaction.objectStore(NAMESPACES_STORE);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function createNamespace(namespace: Namespace): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NAMESPACES_STORE], 'readwrite');
    const store = transaction.objectStore(NAMESPACES_STORE);
    const request = store.add(namespace);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateNamespace(namespace: Namespace): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NAMESPACES_STORE], 'readwrite');
    const store = transaction.objectStore(NAMESPACES_STORE);
    const request = store.put(namespace);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteNamespace(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([NAMESPACES_STORE], 'readwrite');
    const store = transaction.objectStore(NAMESPACES_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Database operations
export async function clearDatabase(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SNIPPETS_STORE, NAMESPACES_STORE], 'readwrite');
    
    const snippetsStore = transaction.objectStore(SNIPPETS_STORE);
    const namespacesStore = transaction.objectStore(NAMESPACES_STORE);
    
    snippetsStore.clear();
    namespacesStore.clear();

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

export async function getDatabaseStats() {
  const snippets = await getAllSnippets();
  const namespaces = await getAllNamespaces();
  const templates = snippets.filter(s => s.isTemplate);
  
  return {
    snippetCount: snippets.length,
    templateCount: templates.length,
    namespaceCount: namespaces.length,
    storageType: 'indexeddb' as const,
    databaseSize: 0, // IndexedDB doesn't provide easy size calculation
  };
}

// Export/Import
export async function exportDatabase(): Promise<{ snippets: Snippet[]; namespaces: Namespace[] }> {
  const snippets = await getAllSnippets();
  const namespaces = await getAllNamespaces();
  return { snippets, namespaces };
}

export async function importDatabase(data: { snippets: Snippet[]; namespaces: Namespace[] }): Promise<void> {
  await clearDatabase();

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SNIPPETS_STORE, NAMESPACES_STORE], 'readwrite');
    const snippetsStore = transaction.objectStore(SNIPPETS_STORE);
    const namespacesStore = transaction.objectStore(NAMESPACES_STORE);

    // Import namespaces
    for (const namespace of data.namespaces) {
      namespacesStore.add(namespace);
    }

    // Import snippets
    for (const snippet of data.snippets) {
      snippetsStore.add(snippet);
    }

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });
}

// Comment operations

export async function getSnippetComments(snippetId: string): Promise<SnippetComment[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPET_COMMENTS_STORE], 'readonly');
    const store = tx.objectStore(SNIPPET_COMMENTS_STORE);
    const index = store.index('snippetId');
    const request = index.getAll(snippetId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result as SnippetComment[];
      results.sort((a, b) => a.createdAt - b.createdAt);
      resolve(results);
    };
  });
}

export async function createSnippetComment(comment: SnippetComment): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([SNIPPET_COMMENTS_STORE], 'readwrite');
    const store = tx.objectStore(SNIPPET_COMMENTS_STORE);
    const request = store.add(comment);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getProfileComments(profileUserId: string): Promise<ProfileComment[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([PROFILE_COMMENTS_STORE], 'readonly');
    const store = tx.objectStore(PROFILE_COMMENTS_STORE);
    const index = store.index('profileUserId');
    const request = index.getAll(profileUserId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result as ProfileComment[];
      results.sort((a, b) => a.createdAt - b.createdAt);
      resolve(results);
    };
  });
}

export async function createProfileComment(comment: ProfileComment): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([PROFILE_COMMENTS_STORE], 'readwrite');
    const store = tx.objectStore(PROFILE_COMMENTS_STORE);
    const request = store.add(comment);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

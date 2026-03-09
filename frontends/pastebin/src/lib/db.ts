/**
 * Unified storage interface - routes to IndexedDB or DBAL based on configuration
 */

import type { Snippet, Namespace, SnippetComment, ProfileComment } from './types';
import { getStorageConfig, DBALStorageAdapter } from './storage';
import * as IndexedDBStorage from './indexeddb-storage';

// Helper to get the active storage backend
function getActiveStorage() {
  const config = getStorageConfig();

  if (config.backend === 'dbal' && config.dbalUrl) {
    return new DBALStorageAdapter(config.dbalUrl);
  }

  return null; // Use IndexedDB
}

// Snippet operations
export async function getAllSnippets(): Promise<Snippet[]> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.getAllSnippets();
  }
  return await IndexedDBStorage.getAllSnippets();
}

export async function getSnippet(id: string): Promise<Snippet | null> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.getSnippet(id);
  }
  return await IndexedDBStorage.getSnippet(id);
}

export async function createSnippet(snippet: Snippet): Promise<Snippet> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.createSnippet(snippet);
  }
  await IndexedDBStorage.createSnippet(snippet);
  return snippet;
}

export async function updateSnippet(snippet: Snippet): Promise<void> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.updateSnippet(snippet);
  }
  return await IndexedDBStorage.updateSnippet(snippet);
}

export async function deleteSnippet(id: string): Promise<void> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.deleteSnippet(id);
  }
  return await IndexedDBStorage.deleteSnippet(id);
}

export async function getSnippetsByNamespace(namespaceId: string): Promise<Snippet[]> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.getSnippetsByNamespace(namespaceId);
  }
  return await IndexedDBStorage.getSnippetsByNamespace(namespaceId);
}

export async function moveSnippetToNamespace(snippetId: string, namespaceId: string): Promise<void> {
  const snippet = await getSnippet(snippetId);
  if (!snippet) throw new Error('Snippet not found');
  
  snippet.namespaceId = namespaceId;
  snippet.updatedAt = Date.now();
  
  await updateSnippet(snippet);
}

export async function bulkMoveSnippets(snippetIds: string[], namespaceId: string): Promise<void> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.bulkMoveSnippets(snippetIds, namespaceId);
  }
  for (const id of snippetIds) {
    await moveSnippetToNamespace(id, namespaceId);
  }
}

export async function getAllTemplates(): Promise<Snippet[]> {
  const snippets = await getAllSnippets();
  return snippets.filter(s => s.isTemplate);
}

export async function createTemplate(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const template: Snippet = {
    ...snippet,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  };
  await createSnippet(template);
}

export async function syncTemplatesFromJSON(templates: unknown[]): Promise<void> {
  // This would sync predefined templates - implement as needed
  console.log('Syncing templates', templates.length);
}

export async function seedDatabase(): Promise<void> {
  // Seed with default namespace if needed
  const namespaces = await getAllNamespaces();
  if (namespaces.length === 0) {
    await ensureDefaultNamespace();
  }
}

// Namespace operations
export async function getAllNamespaces(): Promise<Namespace[]> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.getAllNamespaces();
  }
  return await IndexedDBStorage.getAllNamespaces();
}

export async function getNamespaceById(id: string): Promise<Namespace | null> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.getNamespace(id);
  }
  return await IndexedDBStorage.getNamespace(id);
}

export async function createNamespace(namespace: Namespace): Promise<Namespace> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.createNamespace(namespace);
  }
  await IndexedDBStorage.createNamespace(namespace);
  return namespace;
}

export async function updateNamespace(id: string, name: string): Promise<Namespace> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.updateNamespace(id, name);
  }
  const all = await IndexedDBStorage.getAllNamespaces();
  const existing = all.find(n => n.id === id);
  if (!existing) throw new Error('Namespace not found');
  await IndexedDBStorage.updateNamespace({ ...existing, name });
  const updated = await IndexedDBStorage.getAllNamespaces();
  const result = updated.find(n => n.id === id);
  if (!result) throw new Error('Namespace not found after update');
  return result;
}

export async function deleteNamespace(id: string): Promise<void> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.deleteNamespace(id);
  }
  return await IndexedDBStorage.deleteNamespace(id);
}

export async function ensureDefaultNamespace(): Promise<Namespace> {
  const namespaces = await getAllNamespaces();
  let defaultNs = namespaces.find(ns => ns.isDefault);

  if (!defaultNs) {
    const newDefault: Namespace = {
      id: 'default',
      name: 'Default',
      createdAt: Date.now(),
      isDefault: true,
    };
    defaultNs = await createNamespace(newDefault);
  }

  return defaultNs;
}

// Database operations
export async function initDB(): Promise<void> {
  // Initialize IndexedDB or verify DBAL connection
  const adapter = getActiveStorage();
  if (adapter) {
    const connected = await adapter.testConnection();
    if (!connected) {
      throw new Error('Failed to connect to DBAL backend');
    }
  } else {
    // Initialize IndexedDB
    await IndexedDBStorage.openDB();
  }

  // Ensure default namespace exists
  await ensureDefaultNamespace();
}

export async function clearDatabase(): Promise<void> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.clearDatabase();
  }
  return await IndexedDBStorage.clearDatabase();
}

export async function getDatabaseStats() {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.getStats();
  }
  return await IndexedDBStorage.getDatabaseStats();
}

export async function exportDatabase(): Promise<string> {
  const adapter = getActiveStorage();
  if (adapter) {
    const data = await adapter.exportDatabase();
    return JSON.stringify(data, null, 2);
  }
  const data = await IndexedDBStorage.exportDatabase();
  return JSON.stringify(data, null, 2);
}

export async function importDatabase(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.importDatabase(data);
  }
  await IndexedDBStorage.importDatabase(data);
}

export function validateDatabaseSchema(): Promise<boolean> {
  // With IndexedDB, schema is always valid
  return Promise.resolve(true);
}

// Comment operations

export async function getSnippetComments(snippetId: string): Promise<SnippetComment[]> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.getSnippetComments(snippetId);
  }
  return await IndexedDBStorage.getSnippetComments(snippetId);
}

export async function createSnippetComment(comment: SnippetComment): Promise<SnippetComment> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.createSnippetComment(comment);
  }
  await IndexedDBStorage.createSnippetComment(comment);
  return comment;
}

export async function getProfileComments(profileUserId: string): Promise<ProfileComment[]> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.getProfileComments(profileUserId);
  }
  return await IndexedDBStorage.getProfileComments(profileUserId);
}

export async function createProfileComment(comment: ProfileComment): Promise<ProfileComment> {
  const adapter = getActiveStorage();
  if (adapter) {
    return await adapter.createProfileComment(comment);
  }
  await IndexedDBStorage.createProfileComment(comment);
  return comment;
}

// For backward compatibility
export const saveDB = async () => { /* No-op with IndexedDB */ };

/**
 * Unified storage interface - routes to IndexedDB or Flask based on configuration
 */

import type { Snippet, Namespace } from './types';
import { getStorageConfig, FlaskStorageAdapter } from './storage';
import * as IndexedDBStorage from './indexeddb-storage';

// Helper to get the active storage backend
function getActiveStorage() {
  const config = getStorageConfig();
  
  if (config.backend === 'flask' && config.flaskUrl) {
    return new FlaskStorageAdapter(config.flaskUrl);
  }
  
  return null; // Use IndexedDB
}

// Snippet operations
export async function getAllSnippets(): Promise<Snippet[]> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.getAllSnippets();
  }
  return await IndexedDBStorage.getAllSnippets();
}

export async function getSnippet(id: string): Promise<Snippet | null> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.getSnippet(id);
  }
  return await IndexedDBStorage.getSnippet(id);
}

export async function createSnippet(snippet: Snippet): Promise<void> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.createSnippet(snippet);
  }
  return await IndexedDBStorage.createSnippet(snippet);
}

export async function updateSnippet(snippet: Snippet): Promise<void> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.updateSnippet(snippet);
  }
  return await IndexedDBStorage.updateSnippet(snippet);
}

export async function deleteSnippet(id: string): Promise<void> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.deleteSnippet(id);
  }
  return await IndexedDBStorage.deleteSnippet(id);
}

export async function getSnippetsByNamespace(namespaceId: string): Promise<Snippet[]> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.getSnippetsByNamespace(namespaceId);
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
    id: Date.now().toString(),
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
  const flask = getActiveStorage();
  if (flask) {
    return await flask.getAllNamespaces();
  }
  return await IndexedDBStorage.getAllNamespaces();
}

export async function getNamespaceById(id: string): Promise<Namespace | null> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.getNamespace(id);
  }
  return await IndexedDBStorage.getNamespace(id);
}

export async function createNamespace(namespace: Namespace): Promise<void> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.createNamespace(namespace);
  }
  return await IndexedDBStorage.createNamespace(namespace);
}

export async function deleteNamespace(id: string): Promise<void> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.deleteNamespace(id);
  }
  return await IndexedDBStorage.deleteNamespace(id);
}

export async function ensureDefaultNamespace(): Promise<Namespace> {
  const namespaces = await getAllNamespaces();
  let defaultNs = namespaces.find(ns => ns.isDefault);
  
  if (!defaultNs) {
    defaultNs = {
      id: 'default',
      name: 'Default',
      createdAt: Date.now(),
      isDefault: true,
    };
    await createNamespace(defaultNs);
  }
  
  return defaultNs;
}

// Database operations
export async function initDB(): Promise<void> {
  // Initialize IndexedDB or verify Flask connection
  const flask = getActiveStorage();
  if (flask) {
    const connected = await flask.testConnection();
    if (!connected) {
      throw new Error('Failed to connect to Flask backend');
    }
  } else {
    // Initialize IndexedDB
    await IndexedDBStorage.openDB();
  }
  
  // Ensure default namespace exists
  await ensureDefaultNamespace();
}

export async function clearDatabase(): Promise<void> {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.clearDatabase();
  }
  return await IndexedDBStorage.clearDatabase();
}

export async function getDatabaseStats() {
  const flask = getActiveStorage();
  if (flask) {
    return await flask.getStats();
  }
  return await IndexedDBStorage.getDatabaseStats();
}

export async function exportDatabase(): Promise<string> {
  const flask = getActiveStorage();
  if (flask) {
    const data = await flask.exportDatabase();
    return JSON.stringify(data, null, 2);
  }
  const data = await IndexedDBStorage.exportDatabase();
  return JSON.stringify(data, null, 2);
}

export async function importDatabase(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  const flask = getActiveStorage();
  if (flask) {
    return await flask.importDatabase(data);
  }
  await IndexedDBStorage.importDatabase(data);
}

export function validateDatabaseSchema(): Promise<boolean> {
  // With IndexedDB, schema is always valid
  return Promise.resolve(true);
}

// For backward compatibility
export const saveDB = async () => { /* No-op with IndexedDB */ };

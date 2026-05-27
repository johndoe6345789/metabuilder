/**
 * db snippet and namespace operations
 */

import type { Snippet, Namespace } from './types';
import { getStorageConfig, DBALStorageAdapter } from './storage';
import * as IndexedDBStorage from './indexeddb-storage';

export function getActiveStorage(): DBALStorageAdapter | null {
  const config = getStorageConfig();
  if (config.backend === 'dbal') {
    const url = config.dbalUrl || process.env.NEXT_PUBLIC_DBAL_API_URL || '/api/dbal'
    return new DBALStorageAdapter(url);
  }
  return null;
}

export async function getAllSnippets(): Promise<Snippet[]> {
  const a = getActiveStorage();
  return a ? a.getAllSnippets() : IndexedDBStorage.getAllSnippets();
}

export async function getSnippet(id: string): Promise<Snippet | null> {
  const a = getActiveStorage();
  return a ? a.getSnippet(id) : IndexedDBStorage.getSnippet(id);
}

export async function createSnippet(snippet: Snippet): Promise<Snippet> {
  const a = getActiveStorage();
  if (a) return a.createSnippet(snippet);
  await IndexedDBStorage.createSnippet(snippet);
  return snippet;
}

export async function updateSnippet(snippet: Snippet): Promise<void> {
  const a = getActiveStorage();
  return a ? a.updateSnippet(snippet) : IndexedDBStorage.updateSnippet(snippet);
}

export async function deleteSnippet(id: string): Promise<void> {
  const a = getActiveStorage();
  return a ? a.deleteSnippet(id) : IndexedDBStorage.deleteSnippet(id);
}

export async function getSnippetsByNamespace(
  namespaceId: string
): Promise<Snippet[]> {
  const a = getActiveStorage();
  return a
    ? a.getSnippetsByNamespace(namespaceId)
    : IndexedDBStorage.getSnippetsByNamespace(namespaceId);
}

export async function moveSnippetToNamespace(
  snippetId: string, namespaceId: string
): Promise<void> {
  const snippet = await getSnippet(snippetId);
  if (!snippet) throw new Error('Snippet not found');
  snippet.namespaceId = namespaceId;
  snippet.updatedAt = Date.now();
  await updateSnippet(snippet);
}

export async function bulkMoveSnippets(
  snippetIds: string[], namespaceId: string
): Promise<void> {
  const a = getActiveStorage();
  if (a) return a.bulkMoveSnippets(snippetIds, namespaceId);
  for (const id of snippetIds) await moveSnippetToNamespace(id, namespaceId);
}

export async function getAllTemplates(): Promise<Snippet[]> {
  return (await getAllSnippets()).filter(s => s.isTemplate);
}

export async function createTemplate(
  snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  await createSnippet({
    ...snippet,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isTemplate: true,
  });
}

export async function getAllNamespaces(): Promise<Namespace[]> {
  const a = getActiveStorage();
  return a ? a.getAllNamespaces() : IndexedDBStorage.getAllNamespaces();
}

export async function getNamespaceById(id: string): Promise<Namespace | null> {
  const a = getActiveStorage();
  return a ? a.getNamespace(id) : IndexedDBStorage.getNamespace(id);
}

export async function createNamespace(namespace: Namespace): Promise<Namespace> {
  const a = getActiveStorage();
  if (a) return a.createNamespace(namespace);
  await IndexedDBStorage.createNamespace(namespace);
  return namespace;
}

export async function updateNamespace(
  id: string, name: string
): Promise<Namespace> {
  const a = getActiveStorage();
  if (a) return a.updateNamespace(id, name);
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
  const a = getActiveStorage();
  return a ? a.deleteNamespace(id) : IndexedDBStorage.deleteNamespace(id);
}

export async function ensureDefaultNamespace(): Promise<Namespace> {
  const namespaces = await getAllNamespaces();
  let defaultNs = namespaces.find(ns => ns.isDefault);
  if (!defaultNs) {
    const newDefault: Namespace = {
      id: 'default', name: 'Default',
      createdAt: Date.now(), isDefault: true,
    };
    defaultNs = await createNamespace(newDefault);
  }
  return defaultNs;
}

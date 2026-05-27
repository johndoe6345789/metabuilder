/**
 * db database-level and comment operations
 */

import type { SnippetComment, ProfileComment } from './types';
import * as IndexedDBStorage from './indexeddb-storage';
import {
  getActiveStorage,
  getAllSnippets,
  getAllNamespaces,
  ensureDefaultNamespace,
} from './db-snippets';

export async function initDB(): Promise<void> {
  const adapter = getActiveStorage();
  if (adapter) {
    const connected = await adapter.testConnection();
    if (!connected) throw new Error('Failed to connect to DBAL backend');
  } else {
    await IndexedDBStorage.openDB();
  }
  await ensureDefaultNamespace();
}

export async function clearDatabase(): Promise<void> {
  const a = getActiveStorage();
  return a ? a.clearDatabase() : IndexedDBStorage.clearDatabase();
}

export async function getDatabaseStats() {
  const a = getActiveStorage();
  return a ? a.getStats() : IndexedDBStorage.getDatabaseStats();
}

export async function exportDatabase(): Promise<string> {
  const a = getActiveStorage();
  const data = a
    ? await a.exportDatabase()
    : await IndexedDBStorage.exportDatabase();
  return JSON.stringify(data, null, 2);
}

export async function importDatabase(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  const a = getActiveStorage();
  if (a) return a.importDatabase(data);
  await IndexedDBStorage.importDatabase(data);
}

export function validateDatabaseSchema(): Promise<boolean> {
  return Promise.resolve(true);
}

export async function syncTemplatesFromJSON(templates: unknown[]): Promise<void> {
  console.log('Syncing templates', templates.length);
}

export async function seedDatabase(): Promise<void> {
  const namespaces = await getAllNamespaces();
  if (namespaces.length === 0) await ensureDefaultNamespace();
}

export async function getSnippetComments(
  snippetId: string
): Promise<SnippetComment[]> {
  const a = getActiveStorage();
  return a
    ? a.getSnippetComments(snippetId)
    : IndexedDBStorage.getSnippetComments(snippetId);
}

export async function createSnippetComment(
  comment: SnippetComment
): Promise<SnippetComment> {
  const a = getActiveStorage();
  if (a) return a.createSnippetComment(comment);
  await IndexedDBStorage.createSnippetComment(comment);
  return comment;
}

export async function getProfileComments(
  profileUserId: string
): Promise<ProfileComment[]> {
  const a = getActiveStorage();
  return a
    ? a.getProfileComments(profileUserId)
    : IndexedDBStorage.getProfileComments(profileUserId);
}

export async function createProfileComment(
  comment: ProfileComment
): Promise<ProfileComment> {
  const a = getActiveStorage();
  if (a) return a.createProfileComment(comment);
  await IndexedDBStorage.createProfileComment(comment);
  return comment;
}

export const saveDB = async () => { /* No-op with IndexedDB */ };

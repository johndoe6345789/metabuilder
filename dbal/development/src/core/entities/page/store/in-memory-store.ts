/**
 * @file in-memory-store.ts
 * @description In-memory store interface for page operations (stub)
 */

export interface InMemoryStore {
  pages: Map<string, any>;
  pageSlugs: Map<string, string>;
  generateId(entityType: string): string;
}

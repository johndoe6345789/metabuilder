/**
 * @file in-memory-store.ts
 * @description In-memory store interface for page operations (stub)
 */

export interface InMemoryStore {
  pageConfigs: Map<string, any>;
  pagePaths: Map<string, string>;
  generateId(entityType: string): string;
}

/**
 * @file in-memory-store.ts
 * @description In-memory store interface for workflow operations (stub)
 */

export interface InMemoryStore {
  workflows: Map<string, any>;
  generateId(entityType: string): string;
}

/**
 * @file in-memory-store.ts
 * @description In-memory store interface for session operations (stub)
 */

export interface InMemoryStore {
  sessions: Map<string, any>;
  sessionTokens: Map<string, string>;
  generateId(entityType: string): string;
}

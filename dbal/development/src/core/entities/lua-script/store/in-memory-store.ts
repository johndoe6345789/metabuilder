/**
 * @file in-memory-store.ts
 * @description In-memory store interface for Lua script operations (stub)
 */

export interface InMemoryStore {
  luaScripts: Map<string, any>;
  generateId(entityType: string): string;
}

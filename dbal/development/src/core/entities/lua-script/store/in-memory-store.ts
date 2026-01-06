/**
 * @file in-memory-store.ts
 * @description In-memory store interface for Lua script operations (stub)
 */

export interface InMemoryStore {
  luaScripts: Map<string, any>;
  luaScriptNames: Map<string, string>;
  generateId(entityType: string): string;
}

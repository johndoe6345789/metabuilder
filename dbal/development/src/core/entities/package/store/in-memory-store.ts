/**
 * @file in-memory-store.ts
 * @description In-memory store interface for package operations (stub)
 */

export interface InMemoryStore {
  packages: Map<string, any>;
  packageIds: Map<string, string>;
  generateId(entityType: string): string;
}

/**
 * @file in-memory-store.ts
 * @description In-memory store interface for package operations (stub)
 */

export interface InMemoryStore {
  installedPackages: Map<string, any>;
  packageData: Map<string, any>;
  generateId(entityType: string): string;
}

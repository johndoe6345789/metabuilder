/**
 * @file in-memory-store.ts
 * @description In-memory store interface for user operations (stub)
 */

export interface InMemoryStore {
  users: Map<string, any>;
  userEmails: Map<string, string>;
  usernames: Map<string, string>;
  usersByEmail: Map<string, string>;
  usersByUsername: Map<string, string>;
  generateId(entityType: string): string;
}

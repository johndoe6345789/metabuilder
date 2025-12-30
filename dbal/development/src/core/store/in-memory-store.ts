/**
 * @file in-memory-store.ts
 * @description In-memory store stub
 */

export interface InMemoryStore {
  [key: string]: any;
}

export const createInMemoryStore = (): InMemoryStore => ({});

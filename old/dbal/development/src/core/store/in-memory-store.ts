/**
 * @file in-memory-store.ts
 * @description In-memory store for development/testing
 */

export interface InMemoryStore {
  users: Map<string, unknown>
  usersByEmail: Map<string, string>
  usersByUsername: Map<string, string>
  sessions: Map<string, unknown>
  sessionTokens: Map<string, string>
  workflows: Map<string, unknown>
  workflowNames: Map<string, string>
  installedPackages: Map<string, unknown>
  packageData: Map<string, unknown>
  pageConfigs: Map<string, unknown>
  pagePaths: Map<string, string>
  componentNodes: Map<string, unknown>
  generateId: (entityType: string) => string
}

const generateUuid = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16)
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8
    return value.toString(16)
  })

export const createInMemoryStore = (): InMemoryStore => ({
  users: new Map(),
  usersByEmail: new Map(),
  usersByUsername: new Map(),
  sessions: new Map(),
  sessionTokens: new Map(),
  workflows: new Map(),
  workflowNames: new Map(),
  installedPackages: new Map(),
  packageData: new Map(),
  pageConfigs: new Map(),
  pagePaths: new Map(),
  componentNodes: new Map(),
  generateId: () => generateUuid(),
})

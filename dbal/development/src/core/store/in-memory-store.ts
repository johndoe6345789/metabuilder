/**
 * @file in-memory-store.ts
 * @description In-memory store for development/testing
 */

export interface InMemoryStore {
  users: Map<string, any>
  usersByEmail: Map<string, string>
  usersByUsername: Map<string, string>
  sessions: Map<string, any>
  sessionTokens: Map<string, string>
  workflows: Map<string, any>
  workflowNames: Map<string, string>
  luaScripts: Map<string, any>
  luaScriptNames: Map<string, string>
  packages: Map<string, any>
  packageIds: Map<string, string>
  packageKeys: Map<string, string>
  pages: Map<string, any>
  pageSlugs: Map<string, string>
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
  luaScripts: new Map(),
  luaScriptNames: new Map(),
  packages: new Map(),
  packageIds: new Map(),
  packageKeys: new Map(),
  pages: new Map(),
  pageSlugs: new Map(),
  generateId: () => generateUuid(),
})

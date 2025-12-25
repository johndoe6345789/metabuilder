/**
 * DBAL Stub Implementation
 * 
 * Provides a mock implementation of DBAL when the full DBAL module is not available.
 * This allows the frontend to build and function in development without the full DBAL.
 * 
 * In production, replace this with the actual DBAL module connection.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Error codes for DBAL operations
export enum DBALErrorCode {
  UNKNOWN = 'UNKNOWN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  CONNECTION = 'CONNECTION',
  TIMEOUT = 'TIMEOUT',
  DUPLICATE = 'DUPLICATE',
}

// Custom error class for DBAL operations
export class DBALError extends Error {
  code: DBALErrorCode

  constructor(message: string, code: DBALErrorCode = DBALErrorCode.UNKNOWN) {
    super(message)
    this.name = 'DBALError'
    this.code = code
  }
}

export interface DBALConfig {
  mode?: 'development' | 'production'
  adapter?: string
  database?: {
    url?: string
  }
  security?: {
    sandbox?: 'strict' | 'permissive'
    enableAuditLog?: boolean
  }
}

export interface DBALUser {
  id: string
  email: string
  username?: string
  name?: string
  role?: string
  level?: number
  tenantId?: string
  createdAt?: number | Date
  updatedAt?: number | Date
}

export interface ListResult<T> {
  data: T[]
  total?: number
}

// In-memory store for development
const userStore = new Map<string, DBALUser>([
  ['1', { id: '1', email: 'admin@example.com', username: 'admin', role: 'admin', level: 4 }],
  ['2', { id: '2', email: 'user@example.com', username: 'user', role: 'user', level: 1 }],
])

let nextId = 3

export class DBALClient {
  private config: DBALConfig

  constructor(config: DBALConfig) {
    this.config = config
  }

  users = {
    async list(): Promise<ListResult<DBALUser>> {
      return {
        data: Array.from(userStore.values()),
        total: userStore.size,
      }
    },

    async create(data: Partial<DBALUser>): Promise<DBALUser> {
      const id = String(nextId++)
      const user: DBALUser = {
        id,
        email: data.email || '',
        username: data.username,
        name: data.name,
        role: data.role || 'user',
        level: data.level || 1,
        tenantId: data.tenantId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      userStore.set(id, user)
      return user
    },

    async update(id: string, data: Partial<DBALUser>): Promise<DBALUser> {
      const existing = userStore.get(id)
      if (!existing) {
        throw new Error(`User not found: ${id}`)
      }
      const updated: DBALUser = {
        ...existing,
        ...data,
        id,
        updatedAt: Date.now(),
      }
      userStore.set(id, updated)
      return updated
    },

    async delete(id: string): Promise<boolean> {
      return userStore.delete(id)
    },

    async get(id: string): Promise<DBALUser | null> {
      return userStore.get(id) || null
    },
  }

  async connect(): Promise<void> {
    console.log('[DBAL Stub] Connected (mock mode)')
  }

  async disconnect(): Promise<void> {
    console.log('[DBAL Stub] Disconnected (mock mode)')
  }

  async capabilities(): Promise<{ adapter: string; features: string[] }> {
    return {
      adapter: this.config.adapter || 'stub',
      features: ['users', 'crud', 'mock'],
    }
  }
}

export default DBALClient

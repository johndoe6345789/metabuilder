/**
 * DBAL Stub Module
 * This provides runtime stubs for the DBAL when the full module is not available.
 * Used in the frontend when DBAL is not fully configured.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DBALConfig {
  mode?: 'development' | 'production'
  adapter?: string
  auth?: any
  database?: {
    url?: string
  }
  security?: {
    sandbox?: 'strict' | 'permissive' | 'disabled'
    enableAuditLog?: boolean
  }
  [key: string]: any
}

export interface DBALUser {
  id: string
  email: string
  name?: string
  username?: string
  level?: number
  role?: string
  tenantId?: string
  createdAt?: number | string | Date
  [key: string]: any
}

export interface ListResult<T> {
  data: T[]
  total?: number
}

export interface UsersAPI {
  list(): Promise<ListResult<DBALUser>>
  create(data: Partial<DBALUser>): Promise<DBALUser>
  update(id: string, data: Partial<DBALUser>): Promise<DBALUser>
  delete(id: string): Promise<boolean>
}

export class DBALClient {
  users: UsersAPI

  constructor(_config: DBALConfig) {
    // Stub users API
    this.users = {
      list: async () => ({ data: [], total: 0 }),
      create: async (data) => ({ id: 'stub', email: data.email || '', ...data }),
      update: async (id, data) => ({ id, email: '', ...data }),
      delete: async () => true,
    }
  }

  async query<T>(_sql: string, _params?: unknown[]): Promise<T[]> {
    console.warn('DBAL stub: query not implemented')
    return []
  }

  async execute(_sql: string, _params?: unknown[]): Promise<void> {
    console.warn('DBAL stub: execute not implemented')
  }

  async capabilities(): Promise<Record<string, boolean>> {
    return {
      users: true,
      tenants: false,
      kv: false,
      blob: false,
    }
  }
}

export class DBALError extends Error {
  code: DBALErrorCode

  constructor(message: string, code: DBALErrorCode) {
    super(message)
    this.code = code
    this.name = 'DBALError'
  }
}

export enum DBALErrorCode {
  UNKNOWN = 'UNKNOWN',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

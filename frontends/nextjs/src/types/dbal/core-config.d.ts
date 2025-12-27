/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Root DBAL module declarations.
 * Split from the monolithic dbal.d.ts to keep each set of exports contained.
 */
declare module '@/dbal/development/src' {
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
    constructor(config: DBALConfig)
    query<T>(sql: string, params?: unknown[]): Promise<T[]>
    execute(sql: string, params?: unknown[]): Promise<void>
    capabilities(): Promise<Record<string, boolean>>
  }

  export class DBALError extends Error {
    code: DBALErrorCode
    message: string
    constructor(message: string, code: DBALErrorCode)
  }

  export enum DBALErrorCode {
    UNKNOWN = 'UNKNOWN',
    CONNECTION_ERROR = 'CONNECTION_ERROR',
    QUERY_ERROR = 'QUERY_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
  }
}

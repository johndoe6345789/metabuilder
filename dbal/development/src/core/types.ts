/**
 * @file types.ts
 * @description Core DBAL types
 */

export interface DBALError {
  code: string
  message: string
}

export interface Result<T> {
  success: boolean
  data?: T
  error?: DBALError
}

export interface ListOptions {
  filter?: Record<string, unknown>
  sort?: Record<string, 'asc' | 'desc'>
  page?: number
  limit?: number
}

export interface ListResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type {
  User,
  Credential,
  Session,
  Workflow,
  LuaScript,
  PageConfig,
  ComponentNode,
  ComponentConfig,
  InstalledPackage,
  PackageData,
  Tenant,
  ModelSchema,
  AppConfiguration,
  SystemConfig,
  SMTPConfig,
  CssCategory,
  DropdownConfig,
  Comment,
  ErrorLog,
  PowerTransferRequest,
} from './foundation/types'

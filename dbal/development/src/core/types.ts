/**
 * @file types.ts
 * @description Core DBAL types (stub)
 */

export interface DBALError {
  code: string;
  message: string;
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: DBALError;
}

export interface ListOptions {
  filter?: Record<string, unknown>;
  sort?: Record<string, 'asc' | 'desc'>;
  page?: number;
  limit?: number;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type User = any;
export type Session = any;
export type Page = any;
export type PageView = any;
export type Workflow = any;
export type LuaScript = any;
export type Component = any;

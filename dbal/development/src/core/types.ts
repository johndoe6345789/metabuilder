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

export type User = any;
export type Session = any;
export type Page = any;
export type Workflow = any;
export type LuaScript = any;
export type Component = any;

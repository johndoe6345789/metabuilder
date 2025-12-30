/**
 * @file types.ts
 * @description Type definitions for Lua script operations (stub)
 */

export interface CreateLuaScriptInput {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface LuaScriptView {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

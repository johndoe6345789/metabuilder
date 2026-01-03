/**
 * @file types.ts
 * @description Shared type definitions for entity operations (stub)
 */

export interface LuaScript {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  definition: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Component {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListOptions {
  skip?: number;
  take?: number;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  skip: number;
  take: number;
}

/**
 * @file types.ts
 * @description Type definitions for session operations (stub)
 */

export interface CreateSessionInput {
  userId: string;
  token: string;
  expiresAt?: Date;
  isActive?: boolean;
  lastActivity?: Date;
}

export interface UpdateSessionInput {
  userId?: string;
  token?: string;
  expiresAt?: Date;
  isActive?: boolean;
  lastActivity?: Date;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt?: Date;
  isActive?: boolean;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ListOptions {
  filter?: Record<string, any>;
  sort?: Record<string, 'asc' | 'desc'>;
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface ListResult<T> {
  items?: T[];
  data?: T[];
  total: number;
  skip?: number;
  take?: number;
}

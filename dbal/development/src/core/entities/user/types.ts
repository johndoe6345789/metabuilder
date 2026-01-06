/**
 * @file types.ts
 * @description Type definitions for user operations (stub)
 */

export interface CreateUserInput {
  username: string;
  email: string;
  password?: string;
  isActive?: boolean;
  role?: 'user' | 'admin' | 'god' | 'supergod';
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  role?: 'user' | 'admin' | 'god' | 'supergod';
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  isActive?: boolean;
  role?: 'user' | 'admin' | 'god' | 'supergod';
  firstName?: string;
  lastName?: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserView {
  id: string;
  username: string;
  email: string;
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

/**
 * @file types.ts
 * @description Type definitions for page operations (stub)
 */

export interface CreatePageInput {
  slug: string;
  title: string;
  description?: string;
  level?: string;
  layout?: string;
  isActive?: boolean;
}

export interface UpdatePageInput {
  slug?: string;
  title?: string;
  description?: string;
  level?: string;
  layout?: string;
  isActive?: boolean;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  description?: string;
  level?: string;
  layout?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageView {
  id: string;
  slug: string;
  title: string;
  description?: string;
  level?: string;
  layout?: string;
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

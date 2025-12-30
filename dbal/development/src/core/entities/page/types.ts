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

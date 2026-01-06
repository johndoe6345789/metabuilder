/**
 * @file types.ts
 * @description Type definitions for package operations (stub)
 */

export interface CreatePackageInput {
  packageId?: string;
  name: string;
  version?: string;
  description?: string;
  isPublished?: boolean;
  author?: string;
  manifest?: any;
  isInstalled?: boolean;
  installedAt?: Date;
  installedBy?: string;
}

export interface UpdatePackageInput {
  name?: string;
  version?: string;
  description?: string;
  isPublished?: boolean;
  author?: string;
  manifest?: any;
  isInstalled?: boolean;
  installedAt?: Date;
  installedBy?: string;
}

export interface Package {
  id: string;
  packageId?: string;
  name: string;
  version?: string;
  description?: string;
  isPublished?: boolean;
  author?: string;
  manifest?: any;
  isInstalled?: boolean;
  installedAt?: Date;
  installedBy?: string;
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

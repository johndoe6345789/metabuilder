/**
 * @file types.ts
 * @description Type definitions for package operations (stub)
 */

export interface CreatePackageInput {
  packageId: string;
  name: string;
  version?: string;
  description?: string;
  isPublished?: boolean;
}

export interface Package {
  id: string;
  packageId: string;
  name: string;
  version?: string;
  description?: string;
  isPublished: boolean;
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

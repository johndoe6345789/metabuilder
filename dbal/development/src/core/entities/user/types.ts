/**
 * @file types.ts
 * @description Type definitions for user operations (stub)
 */

export interface CreateUserInput {
  username: string;
  email: string;
  password?: string;
  isActive?: boolean;
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

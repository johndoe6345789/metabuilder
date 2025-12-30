/**
 * @file types.ts
 * @description Type definitions for session operations (stub)
 */

export interface CreateSessionInput {
  userId: string;
  expiresAt?: Date;
}

export interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt?: Date;
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

/**
 * Session type definitions
 */
export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: number
  createdAt: number
  updatedAt?: number
  lastActivity?: number
}

export interface CreateSessionData {
  userId: string
  token: string
  expiresAt: number
  lastActivity?: number
}

export type CreateSessionInput = CreateSessionData

export interface UpdateSessionInput {
  expiresAt?: number
  lastActivity?: number
}

export interface ListSessionsOptions {
  userId?: string
  limit?: number
}

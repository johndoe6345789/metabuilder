import type { Credential as GeneratedCredential, Session as GeneratedSession } from '../types.generated'

export type Credential = GeneratedCredential
export type Session = GeneratedSession

export interface CreateSessionInput {
  id?: string
  userId: string
  token: string
  expiresAt: bigint
  createdAt?: bigint
  lastActivity?: bigint
  ipAddress?: string | null
  userAgent?: string | null
}

export interface UpdateSessionInput {
  [key: string]: unknown
  userId?: string
  token?: string
  expiresAt?: bigint
  lastActivity?: bigint
  ipAddress?: string | null
  userAgent?: string | null
}

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
}

export interface CreateSessionData {
  userId: string
  token: string
  expiresAt: number
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: number
  createdAt: number
  lastActivity: number
}

export interface CreateSessionInput {
  userId: string
  expiresAt: number
  id?: string
  token?: string
  createdAt?: number
  lastActivity?: number
}

export interface UpdateSessionInput {
  token?: string
  expiresAt?: number
  lastActivity?: number
}

export interface ListSessionsOptions {
  userId?: string
  includeExpired?: boolean
}

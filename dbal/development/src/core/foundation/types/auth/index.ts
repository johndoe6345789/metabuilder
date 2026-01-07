export interface Credential {
  username: string
  passwordHash: string
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: bigint
  createdAt: bigint
  lastActivity: bigint
  ipAddress?: string | null
  userAgent?: string | null
}

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
  userId?: string
  token?: string
  expiresAt?: bigint
  lastActivity?: bigint
  ipAddress?: string | null
  userAgent?: string | null
}

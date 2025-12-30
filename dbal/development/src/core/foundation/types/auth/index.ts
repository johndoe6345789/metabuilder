export interface Credential {
  id: string
  username: string
  passwordHash: string
  firstLogin: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  lastActivity: Date
}

export interface CreateSessionInput {
  userId: string
  token: string
  expiresAt: Date
}

export interface UpdateSessionInput {
  userId?: string
  token?: string
  expiresAt?: Date
  lastActivity?: Date
}

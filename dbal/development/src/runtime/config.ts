export interface DBALConfig {
  mode: 'development' | 'production'
  adapter: 'prisma' | 'sqlite' | 'mongodb' | 'postgres' | 'mysql'
  endpoint?: string
  auth?: {
    user: User
    session: Session
  }
  database?: {
    url?: string
    options?: Record<string, unknown>
  }
  security?: {
    sandbox: 'strict' | 'permissive' | 'disabled'
    enableAuditLog: boolean
  }
  performance?: {
    connectionPoolSize?: number
    queryTimeout?: number
  }
}

export interface User {
  id: string
  username: string
  role: 'user' | 'admin' | 'god' | 'supergod'
}

export interface Session {
  id: string
  token: string
  expiresAt: Date
}

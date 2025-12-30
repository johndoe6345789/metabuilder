import type { DBALAdapter } from '../adapter'

export interface User {
  id: string
  username: string
  role: 'user' | 'admin' | 'god' | 'supergod'
}

export interface ACLRule {
  entity: string
  roles: string[]
  operations: string[]
  rowLevelFilter?: (user: User, data: Record<string, unknown>) => boolean
}

export interface ACLAdapterOptions {
  rules?: ACLRule[]
  auditLog?: boolean
}

export interface ACLContext {
  baseAdapter: DBALAdapter
  user: User
  rules: ACLRule[]
  auditLog: boolean
  logger: (entity: string, operation: string, success: boolean, message?: string) => void
}

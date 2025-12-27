/**
 * @file types.ts
 * @description Type definitions for ACL adapter
 */

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

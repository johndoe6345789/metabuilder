import type { User } from '../../types/level-types'
import type { JsonObject } from '@/types/utility-types'

export type OperationType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
export type ResourceType =
  | 'user'
  | 'workflow'
  | 'luaScript'
  | 'pageConfig'
  | 'modelSchema'
  | 'comment'
  | 'componentNode'
  | 'componentConfig'
  | 'cssCategory'
  | 'dropdownConfig'
  | 'tenant'
  | 'powerTransfer'
  | 'smtpConfig'
  | 'credential'

export interface AuditLog {
  id: string
  timestamp: number
  userId: string
  username: string
  operation: OperationType
  resource: ResourceType
  resourceId: string
  success: boolean
  errorMessage?: string
  ipAddress?: string
  metadata?: JsonObject
}

export interface SecurityContext {
  user: User
  ipAddress?: string
  requestId?: string
}

export interface AccessRule {
  resource: ResourceType
  operation: OperationType
  allowedRoles: string[]
  customCheck?: (ctx: SecurityContext, resourceId?: string) => Promise<boolean>
}

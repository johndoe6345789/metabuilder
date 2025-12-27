import type { DBALAdapter } from '../adapter'
import type { User, ACLRule } from '../acl/types'
import { logAudit } from '../acl/audit-logger'
import { defaultACLRules } from '../acl/default-rules'

export interface ACLContext {
  baseAdapter: DBALAdapter
  user: User
  rules: ACLRule[]
  auditLog: boolean
  logger: (entity: string, operation: string, success: boolean, message?: string) => void
}

export const createContext = (
  baseAdapter: DBALAdapter,
  user: User,
  options?: { rules?: ACLRule[]; auditLog?: boolean },
): ACLContext => {
  const auditLog = options?.auditLog ?? true
  const rules = options?.rules || defaultACLRules
  const logger = (entity: string, operation: string, success: boolean, message?: string) => {
    if (auditLog) {
      logAudit(entity, operation, success, user, message)
    }
  }

  return {
    baseAdapter,
    user,
    rules,
    auditLog,
    logger,
  }
}

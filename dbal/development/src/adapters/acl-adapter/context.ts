import type { DBALAdapter } from '../adapter'
import type { ACLAdapterOptions, ACLContext, ACLRule, User } from './types'
import { logAudit } from '../acl/audit-logger'
import { defaultACLRules } from '../acl/default-rules'

export const createContext = (
  baseAdapter: DBALAdapter,
  user: User,
  options?: ACLAdapterOptions,
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

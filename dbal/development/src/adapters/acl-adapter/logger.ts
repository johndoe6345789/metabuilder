import { logAudit } from '../acl/audit-logger'
import type { User } from '../acl/types'

export type AuditLogger = (
  entity: string,
  operation: string,
  success: boolean,
  message?: string
) => void

export const createAuditLogger = (user: User, enabled: boolean): AuditLogger => {
  if (!enabled) {
    return () => {}
  }

  return (entity, operation, success, message) =>
    logAudit(entity, operation, success, user, message)
}

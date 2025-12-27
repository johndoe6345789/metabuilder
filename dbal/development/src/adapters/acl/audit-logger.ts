/**
 * @file audit-logger.ts
 * @description Audit logging for ACL operations
 */

import type { User } from './types'

/**
 * Log audit entry for ACL operation
 */
export const logAudit = (
  entity: string,
  operation: string,
  success: boolean,
  user: User,
  message?: string
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    user: user.username,
    userId: user.id,
    role: user.role,
    entity,
    operation,
    success,
    message
  }
  console.log('[DBAL Audit]', JSON.stringify(logEntry))
}

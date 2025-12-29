import { addAuditLog } from './audit-log-store'
import type { AuditLog,OperationType, ResourceType, SecurityContext } from './types'

/**
 * Log an operation for audit trail
 */
export async function logOperation(
  ctx: SecurityContext,
  operation: OperationType,
  resource: ResourceType,
  resourceId: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    userId: ctx.user.id,
    username: ctx.user.username,
    operation,
    resource,
    resourceId,
    success,
    errorMessage,
    ipAddress: ctx.ipAddress,
  }

  try {
    addAuditLog(log)
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', log)
    }
  } catch (error) {
    console.error('Failed to log operation:', error)
  }
}

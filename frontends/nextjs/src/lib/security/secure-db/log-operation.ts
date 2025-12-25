import type { SecurityContext, OperationType, ResourceType, AuditLog } from './types'

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
    // TODO: Replace with proper audit log storage
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', log)
    }
    // In production, this would write to a persistent audit log table
    // await Database.addAuditLog(log)
  } catch (error) {
    console.error('Failed to log operation:', error)
  }
}

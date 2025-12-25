import type { AuditLog, SecurityContext } from '../types'
import { listAuditLogs } from '../audit-log-store'

/**
 * Fetch audit logs with role checks
 */
export async function getAuditLogs(
  ctx: SecurityContext,
  limit: number = 100
): Promise<AuditLog[]> {
  if (ctx.user.role !== 'supergod' && ctx.user.role !== 'god') {
    throw new Error('Access denied. Only god-tier users can view audit logs.')
  }

  return listAuditLogs(limit)
}

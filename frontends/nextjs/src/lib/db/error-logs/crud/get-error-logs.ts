import { getAdapter } from '../../core/dbal-client'
import type { ErrorLog } from '../types'

/**
 * Get all error logs from database
 */
export async function getErrorLogs(options?: { limit?: number; level?: string; resolved?: boolean; tenantId?: string }): Promise<ErrorLog[]> {
  const adapter = getAdapter()
  const result = await adapter.list('ErrorLog')
  
  let logs = (result.data as any[]).map((log) => ({
    id: log.id,
    timestamp: Number(log.timestamp),
    level: log.level as 'error' | 'warning' | 'info',
    message: log.message,
    stack: log.stack || undefined,
    context: log.context || undefined,
    userId: log.userId || undefined,
    username: log.username || undefined,
    tenantId: log.tenantId || undefined,
    source: log.source || undefined,
    resolved: log.resolved,
    resolvedAt: log.resolvedAt ? Number(log.resolvedAt) : undefined,
    resolvedBy: log.resolvedBy || undefined,
  }))

  // Apply filters
  if (options?.level) {
    logs = logs.filter(log => log.level === options.level)
  }
  if (options?.resolved !== undefined) {
    logs = logs.filter(log => log.resolved === options.resolved)
  }
  if (options?.tenantId) {
    logs = logs.filter(log => log.tenantId === options.tenantId)
  }

  // Sort by timestamp descending (newest first)
  logs.sort((a, b) => b.timestamp - a.timestamp)

  // Apply limit
  if (options?.limit && options.limit > 0) {
    logs = logs.slice(0, options.limit)
  }

  return logs
}

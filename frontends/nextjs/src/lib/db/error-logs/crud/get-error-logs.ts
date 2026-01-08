import { getAdapter } from '../../core/dbal-client'
import type { ErrorLog } from '../types'

/**
 * Get error logs from database with database-level filtering.
 * Uses DBAL filter to avoid fetching entire table.
 */
export async function getErrorLogs(options?: {
  limit?: number
  level?: string
  resolved?: boolean
  tenantId?: string
}): Promise<ErrorLog[]> {
  const adapter = getAdapter()
  
  // Build filter object for database-level filtering
  const filter: Record<string, unknown> = {}
  if (options?.level !== undefined) {
    filter.level = options.level
  }
  if (options?.resolved !== undefined) {
    filter.resolved = options.resolved
  }
  if (options?.tenantId !== undefined) {
    filter.tenantId = options.tenantId
  }
  
  const result = await adapter.list('ErrorLog', {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    orderBy: [{ timestamp: 'desc' }] as unknown as string,
    limit: options?.limit,
  })

  type ErrorLogRecord = {
    id: string
    timestamp: bigint | number
    level: string
    message: string
    stack?: string | null
    context?: string | null
    userId?: string | null
    username?: string | null
    tenantId?: string | null
    source?: string | null
    resolved: boolean
    resolvedAt?: bigint | number | null
    resolvedBy?: string | null
  }

  const logs = (result.data as ErrorLogRecord[]).map(log => ({
    id: log.id,
    timestamp: Number(log.timestamp),
    level: log.level as 'error' | 'warning' | 'info',
    message: log.message,
    stack: log.stack ?? undefined,
    context: log.context ?? undefined,
    userId: log.userId ?? undefined,
    username: log.username ?? undefined,
    tenantId: log.tenantId ?? undefined,
    source: log.source ?? undefined,
    resolved: log.resolved,
    resolvedAt: (log.resolvedAt !== null && log.resolvedAt !== undefined) ? Number(log.resolvedAt) : undefined,
    resolvedBy: log.resolvedBy ?? undefined,
  }))

  return logs
}

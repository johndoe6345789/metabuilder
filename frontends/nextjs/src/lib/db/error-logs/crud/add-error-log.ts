import { getAdapter } from '../../core/dbal-client'
import type { ErrorLog } from '../types'

/**
 * Add a single error log entry
 */
export async function addErrorLog(log: Omit<ErrorLog, 'id'>): Promise<string> {
  const adapter = getAdapter()
  const id = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  await adapter.create('ErrorLog', {
    id,
    timestamp: BigInt(log.timestamp),
    level: log.level,
    message: log.message,
    stack: log.stack ?? null,
    context: log.context ?? null,
    userId: log.userId ?? null,
    username: log.username ?? null,
    tenantId: log.tenantId ?? null,
    source: log.source ?? null,
    resolved: log.resolved,
    resolvedAt: log.resolvedAt !== null && log.resolvedAt !== undefined ? BigInt(log.resolvedAt) : null,
    resolvedBy: log.resolvedBy ?? null,
  })

  return id
}

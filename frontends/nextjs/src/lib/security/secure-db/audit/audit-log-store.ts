import type { AuditLog } from './types'

const DEFAULT_AUDIT_LOG_LIMIT = 100
const MAX_AUDIT_LOGS = 1000
const auditLogs: AuditLog[] = []

const normalizeLimit = (limit: number): number => {
  if (!Number.isFinite(limit)) return DEFAULT_AUDIT_LOG_LIMIT
  return Math.max(0, Math.floor(limit))
}

export const addAuditLog = (log: AuditLog): void => {
  auditLogs.push(log)

  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.splice(0, auditLogs.length - MAX_AUDIT_LOGS)
  }
}

export const listAuditLogs = (limit: number = DEFAULT_AUDIT_LOG_LIMIT): AuditLog[] => {
  const normalizedLimit = normalizeLimit(limit)
  if (normalizedLimit === 0) return []

  const slice = auditLogs.slice(-normalizedLimit)
  return slice.reverse()
}

// Alias for backwards compatibility
export const getAuditLogs = listAuditLogs

export const clearAuditLogs = (): void => {
  auditLogs.length = 0
}

export { DEFAULT_AUDIT_LOG_LIMIT, MAX_AUDIT_LOGS }

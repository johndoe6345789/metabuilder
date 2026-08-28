/**
 * A workflow context reduced to what is safe to write to a log.
 *
 * The previous version spread the whole metadata object and truncated only
 * the IP and user agent, which left userEmail and sessionId in the log in
 * full. A session id in a log is a credential in a log: anyone who can read
 * the log can resume the session. Fields are now named individually, so
 * adding a sensitive one to the metadata does not silently start logging it.
 */

import type { ExtendedWorkflowContext } from '../multi-tenant-context'

/** Keeps enough of a value to correlate entries, not enough to reuse it. */
export function truncate(
  value: string | undefined,
  keep: number
): string | undefined {
  if (value === undefined) return undefined
  return value.length <= keep ? value : `${value.substring(0, keep)}...`
}

/** An email as its domain only: enough to tell tenants apart. */
export function maskEmail(email: string | undefined): string | undefined {
  if (email === undefined || email === '') return undefined
  const at = email.lastIndexOf('@')
  return at === -1 ? '***' : `***@${email.slice(at + 1)}`
}

export function sanitizeContextForLogging(
  context: ExtendedWorkflowContext
): Record<string, unknown> {
  const meta = context.multiTenant
  return {
    executionId: context.executionId,
    tenantId: context.tenantId,
    userId: context.userId,
    trigger: context.trigger.kind,
    multiTenant: {
      enforced: meta.enforced,
      tenantId: meta.tenantId,
      userId: meta.userId,
      userLevel: meta.userLevel,
      userEmail: maskEmail(meta.userEmail),
      requestedAt: meta.requestedAt,
      executionMode: meta.executionMode,
      ipAddress: truncate(meta.ipAddress, 10),
      userAgent: truncate(meta.userAgent, 20),
      // sessionId is deliberately absent.
    },
    executionLimits: context.executionLimits,
    // Names only: the values are the caller's data.
    variables: Object.keys(context.variables),
  }
}

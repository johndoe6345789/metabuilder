import { Database } from '@/lib/database'

/**
 * Log an error to the database
 */
export async function logError(
  error: Error | string,
  options?: {
    level?: 'error' | 'warning' | 'info'
    context?: Record<string, any>
    userId?: string
    username?: string
    tenantId?: string
    source?: string
  }
): Promise<string> {
  const message = typeof error === 'string' ? error : error.message
  const stack = typeof error === 'string' ? undefined : error.stack

  return await Database.addErrorLog({
    timestamp: Date.now(),
    level: options?.level || 'error',
    message,
    stack,
    context: options?.context ? JSON.stringify(options.context) : undefined,
    userId: options?.userId,
    username: options?.username,
    tenantId: options?.tenantId,
    source: options?.source,
    resolved: false,
  })
}

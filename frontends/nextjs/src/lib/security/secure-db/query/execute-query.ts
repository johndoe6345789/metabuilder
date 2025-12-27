import type { SecurityContext, OperationType, ResourceType } from './types'
import { checkRateLimit } from '../rate-limiting/check-rate-limit'
import { loadRateLimitConfig } from './rate-limit-store'
import { checkAccess } from './check-access'
import { logOperation } from './log-operation'

/**
 * Execute a secure database query with rate limiting, access control, and audit logging
 */
export async function executeQuery<T>(
  ctx: SecurityContext,
  resource: ResourceType,
  operation: OperationType,
  queryFn: () => Promise<T>,
  resourceId: string = 'unknown'
): Promise<T> {
  await loadRateLimitConfig()

  // Check rate limit
  const canProceed = checkRateLimit(ctx.user.id)
  if (!canProceed) {
    await logOperation(ctx, operation, resource, resourceId, false, 'Rate limit exceeded')
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  // Check access permissions
  const hasAccess = await checkAccess(ctx, resource, operation, resourceId)
  if (!hasAccess) {
    await logOperation(ctx, operation, resource, resourceId, false, 'Access denied')
    throw new Error('Access denied. Insufficient permissions.')
  }

  // Execute query
  try {
    const result = await queryFn()
    await logOperation(ctx, operation, resource, resourceId, true)
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await logOperation(ctx, operation, resource, resourceId, false, errorMessage)
    throw error
  }
}

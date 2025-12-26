import type { SecurityContext, OperationType, ResourceType } from './types'
import { ACCESS_RULES } from './access-rules'

/**
 * Check if user has access to perform operation on resource
 */
export async function checkAccess(
  ctx: SecurityContext,
  resource: ResourceType,
  operation: OperationType,
  resourceId?: string
): Promise<boolean> {
  const rule = ACCESS_RULES.find(
    r => r.resource === resource && r.operation === operation
  )
  
  if (!rule) {
    return false
  }
  
  if (!rule.allowedRoles.includes(ctx.user.role)) {
    return false
  }
  
  if (rule.customCheck) {
    return await rule.customCheck(ctx, resourceId)
  }
  
  return true
}

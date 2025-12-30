/**
 * @file check-permission.ts
 * @description Check if user has permission for entity operation
 */

import { DBALError } from '@/core/foundation/errors'
import type { ACLRule, User } from '../acl-adapter/types'

/**
 * Check if user has permission to perform operation on entity
 * @throws DBALError.forbidden if permission denied
 */
export const checkPermission = (
  entity: string,
  operation: string,
  user: User,
  rules: ACLRule[],
  logFn?: (entity: string, operation: string, success: boolean, message?: string) => void
): void => {
  const matchingRules = rules.filter(rule => 
    rule.entity === entity && 
    rule.roles.includes(user.role) &&
    rule.operations.includes(operation)
  )

  if (matchingRules.length === 0) {
    if (logFn) {
      logFn(entity, operation, false, 'Permission denied')
    }
    throw DBALError.forbidden(
      `User ${user.username} (${user.role}) cannot ${operation} ${entity}`
    )
  }
}

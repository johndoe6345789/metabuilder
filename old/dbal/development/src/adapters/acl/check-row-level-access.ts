/**
 * @file check-row-level-access.ts
 * @description Check row-level access permissions
 */

import { DBALError } from '../../core/foundation/errors'
import type { ACLRule, User } from '../acl-adapter/types'

/**
 * Check row-level access for specific data
 * @throws DBALError.forbidden if row-level access denied
 */
export const checkRowLevelAccess = (
  entity: string,
  operation: string,
  data: Record<string, unknown>,
  user: User,
  rules: ACLRule[],
  logFn?: (entity: string, operation: string, success: boolean, message?: string) => void
): void => {
  const matchingRules = rules.filter(rule => 
    rule.entity === entity && 
    rule.roles.includes(user.role) &&
    rule.operations.includes(operation) &&
    rule.rowLevelFilter
  )

  for (const rule of matchingRules) {
    if (rule.rowLevelFilter && !rule.rowLevelFilter(user, data)) {
      if (logFn) {
        logFn(entity, operation, false, 'Row-level access denied')
      }
      throw DBALError.forbidden(
        `Row-level access denied for ${entity}`
      )
    }
  }
}

import { checkPermission } from '../acl/check-permission'
import { checkRowLevelAccess } from '../acl/check-row-level-access'
import { resolvePermissionOperation } from '../acl/resolve-permission-operation'
import type { ACLContext } from './types'

export const enforcePermission = (context: ACLContext, entity: string, operation: string) => {
  checkPermission(entity, operation, context.user, context.rules, context.logger)
}

export const enforceRowAccess = (
  context: ACLContext,
  entity: string,
  operation: string,
  record: Record<string, unknown>,
) => {
  checkRowLevelAccess(entity, operation, record, context.user, context.rules, context.logger)
}

export const withAudit = async <T>(
  context: ACLContext,
  entity: string,
  operation: string,
  action: () => Promise<T>,
) => {
  enforcePermission(context, entity, operation)

  try {
    const result = await action()
    context.logger(entity, operation, true)
    return result
  } catch (error) {
    context.logger(entity, operation, false, (error as Error).message)
    throw error
  }
}

export const resolveOperation = resolvePermissionOperation

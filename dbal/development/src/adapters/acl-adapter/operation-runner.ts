import { resolvePermissionOperation } from '../acl/resolve-permission-operation'
import { checkPermission } from '../acl/check-permission'
import { checkRowLevelAccess } from '../acl/check-row-level-access'
import type { ACLRule, User } from '../acl/types'
import type { AuditLogger } from './logger'

export interface ACLContext {
  user: User
  rules: ACLRule[]
  log: AuditLogger
}

type RowGuard = (result: unknown) => void | Promise<void>

type OperationName =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'findFirst'
  | 'findByField'
  | 'upsert'
  | 'updateByField'
  | 'deleteByField'
  | 'createMany'
  | 'updateMany'
  | 'deleteMany'

const resolveOperation = (operation: string): OperationName =>
  resolvePermissionOperation(operation) as OperationName

export const runWithAccess = async <T>(
  context: ACLContext,
  entity: string,
  operation: OperationName,
  execute: () => Promise<T>,
  rowGuard?: RowGuard
): Promise<T> => {
  checkPermission(entity, operation, context.user, context.rules, context.log)

  try {
    const result = await execute()

    if (result && rowGuard) {
      await rowGuard(result)
    }

    context.log(entity, operation, true)
    return result
  } catch (error) {
    context.log(entity, operation, false, (error as Error).message)
    throw error
  }
}

export const guardRowLevel = (
  entity: string,
  operation: OperationName,
  user: User,
  rules: ACLRule[],
  log: AuditLogger
): RowGuard =>
  (result: unknown) =>
    checkRowLevelAccess(entity, operation, result as Record<string, unknown>, user, rules, log)

export const deriveOperation = (operation: string): OperationName =>
  resolveOperation(operation)

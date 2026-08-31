import { resolveTenantId } from './resolve-tenant-id'
import { listOperation } from './dbal-operation/list-operation'
import { readOperation } from './dbal-operation/read-operation'
import { createOperation } from './dbal-operation/create-operation'
import { updateOperation } from './dbal-operation/update-operation'
import { deleteOperation } from './dbal-operation/delete-operation'
import type {
  DbalOperation,
  DbalOperationContext,
  DbalOperationResult,
} from './dbal-operation/types'

export type {
  DbalOperation,
  DbalOperationContext,
  DbalOperationResult,
} from './dbal-operation/types'

/** Runs one generic CRUD operation against a DBAL entity, scoped to the
 *  caller's tenant. Each operation is a small function in dbal-operation/;
 *  this just resolves the tenant and dispatches to one. */
export async function executeDbalOperation(
  op: DbalOperation,
  context?: DbalOperationContext
): Promise<DbalOperationResult> {
  const { db } = await import('@/lib/db-client')

  try {
    const { entity, operation, id } = op
    const tenantId = resolveTenantId(context)
    const ops = db.entity(entity)

    // Each branch is awaited (not just returned) so a rejection from the
    // operation function lands in this try's own catch below, rather than
    // propagating past it as the caller's problem.
    switch (operation) {
      case 'list':
        return await listOperation(
          ops,
          tenantId !== undefined ? { tenantId } : {}
        )
      case 'read':
        return await readOperation(ops, id)
      case 'create':
        return await createOperation(ops, context?.body, tenantId)
      case 'update':
        return await updateOperation(ops, id, context?.body, tenantId)
      case 'delete':
        return await deleteOperation(ops, id, tenantId)
      default:
        return { success: false, error: `Unknown operation: ${operation}` }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Operation failed',
    }
  }
}

import {
  errorResponse,
  executeDbalOperation,
  executePackageAction,
  STATUS,
  successResponse,
  type DbalOperation,
  type DbalOperationContext,
} from '@/lib/routing'
import { buildCrudResponse } from './build-crud-response'

const OVERRIDABLE_OPERATIONS = ['list', 'read', 'create', 'update', 'delete']

export interface HandleCrudArgs {
  packageId: string
  entity: string
  operation: string
  id: string | undefined
  dbalOp: DbalOperation
  context: DbalOperationContext
}

/** Standard CRUD dispatch: a package's custom REST override wins if it
 *  handles the operation, otherwise it falls through to generic DBAL. */
export async function handleCrud(args: HandleCrudArgs) {
  if (OVERRIDABLE_OPERATIONS.includes(args.operation)) {
    const overrideResult = await executePackageAction(
      args.packageId,
      args.entity,
      args.operation,
      args.id,
      args.context,
      { allowFallback: true }
    )

    if (overrideResult.success) {
      return successResponse(overrideResult.data, STATUS.OK)
    }
    if (overrideResult.code === 'INVALID_CONFIG') {
      return errorResponse(
        overrideResult.error ?? 'Invalid package config',
        STATUS.BAD_REQUEST
      )
    }
  }

  const result = await executeDbalOperation(args.dbalOp, args.context)
  return buildCrudResponse(result, args.operation)
}

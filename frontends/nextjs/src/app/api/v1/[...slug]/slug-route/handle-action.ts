import {
  errorResponse,
  executePackageAction,
  STATUS,
  successResponse,
  type DbalOperationContext,
} from '@/lib/routing'

export interface HandleActionArgs {
  packageId: string
  entity: string
  action: string
  id: string | undefined
  context: DbalOperationContext
}

/** Custom package actions (e.g. POST .../posts/123/like) bypass the
 *  standard CRUD dispatch entirely. */
export async function handleAction(args: HandleActionArgs) {
  const result = await executePackageAction(
    args.packageId,
    args.entity,
    args.action,
    args.id,
    args.context
  )

  if (result.success === false) {
    if (result.code === 'NOT_FOUND') {
      return errorResponse(
        result.error ?? 'Action not found',
        STATUS.NOT_FOUND
      )
    }
    return errorResponse(result.error ?? 'Action failed', STATUS.BAD_REQUEST)
  }

  return successResponse(result.data, STATUS.OK)
}

import {
  errorResponse,
  successResponse,
  STATUS,
  type DbalOperationResult,
} from '@/lib/routing'

/** Maps a DBAL result to a response: known error phrases get a specific
 *  status and everything else is a generic 500; a successful create gets
 *  201, everything else 200. */
export function buildCrudResponse(
  result: DbalOperationResult,
  operation: string
) {
  if (!result.success) {
    const errorMsg = result.error ?? 'Operation failed'
    if (errorMsg.includes('not found')) {
      return errorResponse(errorMsg, STATUS.NOT_FOUND)
    }
    if (errorMsg.includes('required')) {
      return errorResponse(errorMsg, STATUS.BAD_REQUEST)
    }
    return errorResponse(errorMsg, STATUS.INTERNAL_ERROR)
  }

  const responseData =
    result.meta !== null && result.meta !== undefined
      ? { data: result.data, ...(result.meta as Record<string, unknown>) }
      : result.data

  return successResponse(
    responseData,
    operation === 'create' ? STATUS.CREATED : STATUS.OK
  )
}

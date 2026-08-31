import type { NextRequest, NextResponse } from 'next/server'
import { errorResponse, STATUS } from '@/lib/routing'
import { authorizeRequest } from './authorize-request'
import { parseMutationBody } from './parse-mutation-body'
import { handleAction } from './handle-action'
import { handleCrud } from './handle-crud'

export interface RouteParams {
  params: Promise<{ slug: string[] }>
}

/** Handle all RESTful requests with full auth & DBAL execution. */
export async function handleRequest(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { slug } = await params
  const auth = await authorizeRequest(request, slug)
  if (!auth.ok) return auth.response
  const { context, user, tenant } = auth.value
  const { route, operation, dbalOp } = context

  try {
    const parsedBody = await parseMutationBody(request, request.method)
    if (parsedBody.error !== undefined) return parsedBody.error
    const { body } = parsedBody

    if (operation === 'action' && route.action !== undefined) {
      if (tenant == null) {
        return errorResponse('Tenant not found', STATUS.NOT_FOUND)
      }
      return await handleAction({
        packageId: route.package,
        entity: route.entity,
        action: route.action,
        id: route.id,
        context: { user: user ?? undefined, tenant, body },
      })
    }

    if (tenant == null) {
      return errorResponse('Tenant not found', STATUS.NOT_FOUND)
    }
    return await handleCrud({
      packageId: route.package,
      entity: route.entity,
      operation,
      id: route.id,
      dbalOp,
      context: { user: user ?? undefined, tenant, body },
    })
  } catch (error) {
    const { logger, apiError } = await import('@/lib/logging')
    logger.error('DBAL operation failed', error)
    return errorResponse(apiError(error), STATUS.INTERNAL_ERROR)
  }
}

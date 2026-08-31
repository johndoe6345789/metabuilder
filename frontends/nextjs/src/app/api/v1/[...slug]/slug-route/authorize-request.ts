import type { NextRequest, NextResponse } from 'next/server'
import {
  errorResponse,
  getSessionUser,
  parseRestfulRequest,
  STATUS,
  validatePackageRoute,
  validateTenantAccess,
  type RestfulContext,
} from '@/lib/routing'
import { applyRateLimit } from '@/lib/middleware'
import { determineRateLimitType } from './rate-limit-type'
import { resolveUser, type RouteUser } from './resolve-user'

export interface AuthorizedRequest {
  context: RestfulContext
  user: RouteUser | null
  tenant: unknown
}

export type AuthorizeResult =
  | { ok: true; value: AuthorizedRequest }
  | { ok: false; response: NextResponse }

function denied(response: NextResponse): AuthorizeResult {
  return { ok: false, response }
}

/** Rate limit -> parse route -> resolve session -> package check -> tenant
 *  check. Everything a request must clear before touching DBAL. */
export async function authorizeRequest(
  request: NextRequest,
  slug: string[]
): Promise<AuthorizeResult> {
  const rateLimitResponse = applyRateLimit(
    request,
    determineRateLimitType(request)
  )
  if (rateLimitResponse != null) {
    return denied(rateLimitResponse as unknown as NextResponse)
  }

  const context = parseRestfulRequest(request, { slug })
  if ('error' in context) {
    return denied(errorResponse(context.error, context.status))
  }

  const { user: rawUser } = await getSessionUser(request)
  const user = resolveUser(rawUser)

  const packageResult = validatePackageRoute(
    context.route.package,
    context.route.entity,
    user
  )
  if (packageResult.allowed === false) {
    const status = user === null ? STATUS.UNAUTHORIZED : STATUS.FORBIDDEN
    return denied(errorResponse(packageResult.reason ?? 'Access denied', status))
  }

  const tenantResult = await validateTenantAccess(
    user,
    context.route.tenant,
    packageResult.package?.minLevel ?? 1
  )
  if (tenantResult.allowed === false) {
    const status = user === null ? STATUS.UNAUTHORIZED : STATUS.FORBIDDEN
    return denied(errorResponse(tenantResult.reason ?? 'Access denied', status))
  }

  return { ok: true, value: { context, user, tenant: tenantResult.tenant } }
}

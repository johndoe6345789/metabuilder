/**
 * RESTful Multi-Tenant API Route
 * 
 * Pattern: /api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]
 * 
 * Examples:
 *   GET  /api/v1/acme/forum_forge/posts           -> list posts
 *   GET  /api/v1/acme/forum_forge/posts/123       -> read post 123
 *   POST /api/v1/acme/forum_forge/posts           -> create post
 *   PUT  /api/v1/acme/forum_forge/posts/123       -> update post 123
 *   DELETE /api/v1/acme/forum_forge/posts/123     -> delete post 123
 *   POST /api/v1/acme/forum_forge/posts/123/like  -> custom action
 * 
 * Authentication & Authorization:
 *   - Session validated from mb_session cookie
 *   - Tenant access validated (user must belong to tenant or be God+)
 *   - Package minLevel checked against user level
 *   - Entity must be declared in package schema
 */

import type { NextRequest, NextResponse } from 'next/server'

import {
  errorResponse,
  executeDbalOperation,
  executePackageAction,
  getSessionUser,
  parseRestfulRequest,
  STATUS,
  successResponse,
  validatePackageRoute,
  validateTenantAccess,
} from '@/lib/routing'
import { applyRateLimit } from '@/lib/middleware'

interface RouteParams {
  params: Promise<{ slug: string[] }>
}

/**
 * Handle all RESTful requests with full auth & DBAL execution
 */
async function handleRequest(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const resolvedParams = await params

  // 0. Apply rate limiting based on endpoint type
  // Determine endpoint type for appropriate rate limit
  const pathMatch = request.url.match(/\/api\/v1\/[^/]+\/([^/]+)\/([^/]+)/)
  const isLogin = pathMatch?.[1] === 'auth' && pathMatch?.[2] === 'login'
  const isRegister = pathMatch?.[1] === 'auth' && pathMatch?.[2] === 'register'

  // Determine which rate limiter to apply
  let rateLimitType: 'login' | 'register' | 'list' | 'mutation' | 'public' = 'public'
  if (isLogin) {
    rateLimitType = 'login'
  } else if (isRegister) {
    rateLimitType = 'register'
  } else if (request.method === 'GET') {
    rateLimitType = 'list'
  } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    rateLimitType = 'mutation'
  }

  // Check rate limit and return 429 if exceeded
  const rateLimitResponse = applyRateLimit(request, rateLimitType)
  if (rateLimitResponse) {
    return rateLimitResponse as unknown as NextResponse
  }

  // 1. Parse the route
  const context = parseRestfulRequest(request, resolvedParams)
  if ('error' in context) {
    return errorResponse(context.error, context.status)
  }

  const { route, operation, dbalOp } = context

  // 2. Get current user session (may be null for public routes)
  const { user: rawUser } = await getSessionUser()
  
  // Type-safe user with required fields
  const user = rawUser !== null ? {
    id: typeof rawUser.id === 'string' ? rawUser.id : '',
    role: typeof rawUser.role === 'string' ? rawUser.role : 'public',
    tenantId: typeof rawUser.tenantId === 'string' ? rawUser.tenantId : null,
  } : null
  
  // 3. Validate package exists and user has required level
  const packageResult = validatePackageRoute(route.package, route.entity, user)
  if (packageResult.allowed === false) {
    const status = user === null ? STATUS.UNAUTHORIZED : STATUS.FORBIDDEN
    return errorResponse(packageResult.reason ?? 'Access denied', status)
  }

  // 4. Validate tenant access
  const tenantResult = await validateTenantAccess(
    user,
    route.tenant,
    packageResult.package?.minLevel ?? 1
  )
  if (tenantResult.allowed === false) {
    const status = user === null ? STATUS.UNAUTHORIZED : STATUS.FORBIDDEN
    return errorResponse(tenantResult.reason ?? 'Access denied', status)
  }

  // 5. Execute the DBAL operation
  try {
    // Parse request body for mutations
    let body: Record<string, unknown> | undefined
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const text = await request.text()
        if (text.length > 0) {
          body = JSON.parse(text) as Record<string, unknown>
        }
      } catch {
        return errorResponse('Invalid JSON body', STATUS.BAD_REQUEST)
      }
    }

    // Handle custom actions separately
    if (operation === 'action' && route.action !== undefined) {
      if (tenantResult.tenant === null || tenantResult.tenant === undefined) {
        return errorResponse('Tenant not found', STATUS.NOT_FOUND)
      }

      const actionResult = await executePackageAction(
        route.package,
        route.entity,
        route.action,
        route.id,
        { user: user ?? undefined, tenant: tenantResult.tenant, body }
      )
      
      if (actionResult.success === false) {
        if (actionResult.code === 'NOT_FOUND') {
          return errorResponse(actionResult.error ?? 'Action not found', STATUS.NOT_FOUND)
        }
        return errorResponse(actionResult.error ?? 'Action failed', STATUS.BAD_REQUEST)
      }
      
      return successResponse(actionResult.data, STATUS.OK)
    }

    // Ensure tenant is available for CRUD operations
    if (tenantResult.tenant === null || tenantResult.tenant === undefined) {
      return errorResponse('Tenant not found', STATUS.NOT_FOUND)
    }

    // Custom REST overrides take priority for standard operations.
    if (['list', 'read', 'create', 'update', 'delete'].includes(operation)) {
      const overrideResult = await executePackageAction(
        route.package,
        route.entity,
        operation,
        route.id,
        { user: user ?? undefined, tenant: tenantResult.tenant, body },
        { allowFallback: true }
      )

      if (overrideResult.success) {
        return successResponse(overrideResult.data, STATUS.OK)
      }

      if (overrideResult.code === 'INVALID_CONFIG') {
        return errorResponse(overrideResult.error ?? 'Invalid package config', STATUS.BAD_REQUEST)
      }
    }

    // Execute standard CRUD operation
    const result = await executeDbalOperation(dbalOp, {
      user: user ?? undefined,
      tenant: tenantResult.tenant,
      body,
    })

    if (!result.success) {
      // Map common errors to appropriate status codes
      const errorMsg = result.error ?? 'Operation failed'
      if (errorMsg.includes('not found')) {
        return errorResponse(errorMsg, STATUS.NOT_FOUND)
      }
      if (errorMsg.includes('required')) {
        return errorResponse(errorMsg, STATUS.BAD_REQUEST)
      }
      return errorResponse(errorMsg, STATUS.INTERNAL_ERROR)
    }

    // Build response with metadata
    const responseData = result.meta !== null && result.meta !== undefined
      ? { data: result.data, ...(result.meta as Record<string, unknown>) }
      : result.data

    // Map operation to appropriate status code
    switch (operation) {
      case 'create':
        return successResponse(responseData, STATUS.CREATED)
      case 'delete':
        return successResponse(responseData, STATUS.OK)
      default:
        return successResponse(responseData, STATUS.OK)
    }
  } catch (error) {
    const { logger, apiError } = await import('@/lib/logging')
    logger.error('DBAL operation failed', error)
    return errorResponse(apiError(error), STATUS.INTERNAL_ERROR)
  }
}

export async function GET(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

export async function POST(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

export async function PUT(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

export async function PATCH(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

export async function DELETE(request: NextRequest, params: RouteParams) {
  return handleRequest(request, params)
}

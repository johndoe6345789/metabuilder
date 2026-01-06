import { NextResponse } from 'next/server'

/**
 * Routing utilities (stub)
 */

export function parseRoute(path: string): Record<string, string> {
  const params: Record<string, string> = {}
  
  // Extract query parameters from path
  const [pathname = '', queryString] = path.split('?')
  
  if (queryString !== undefined && queryString.length > 0) {
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      params[key] = value
    })
  }
  
  // Extract path segments
  const segments = pathname.split('/').filter(s => s.length > 0)
  segments.forEach((segment, index) => {
    params[`segment${index}`] = segment
  })
  
  return params
}

export function buildRoute(template: string, params: Record<string, string>): string {
  let route = template
  
  // Replace named parameters in the template
  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    const colonPlaceholder = `:${key}`
    
    if (route.includes(placeholder)) {
      route = route.replace(placeholder, value)
    } else if (route.includes(colonPlaceholder)) {
      route = route.replace(colonPlaceholder, value)
    }
  })
  
  return route
}

export const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ERROR: 500,
  INTERNAL_ERROR: 500,
}

export function successResponse(data: unknown, status = STATUS.OK) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = STATUS.ERROR) {
  return NextResponse.json({ error: message }, { status })
}

export interface SessionUser {
  user: Record<string, unknown> | null
}

export async function getSessionUser(_req?: Request): Promise<SessionUser> {
  try {
    // Use fetchSession to get current user from cookies
    const { fetchSession } = await import('@/lib/auth/api/fetch-session')
    const user = await fetchSession()
    
    if (user === null) {
      return { user: null }
    }
    
    // Convert User to Record<string, unknown> for compatibility
    // Use spread operator for maintainability
    return { 
      user: {
        ...user,
        tenantId: user.tenantId ?? null,
        profilePicture: user.profilePicture ?? null,
        bio: user.bio ?? null,
        isInstanceOwner: user.isInstanceOwner ?? false,
      }
    }
  } catch (error) {
    console.error('Error getting session user:', error)
    return { user: null }
  }
}

export interface RestfulContext {
  route: {
    tenant: string
    package: string
    entity: string
    id?: string
    action?: string
  }
  operation: string
  dbalOp: unknown
}

export function parseRestfulRequest(
  req: Request,
  params: { slug: string[] }
): RestfulContext | { error: string; status: number } {
  const { slug } = params
  const method = req.method
  
  // Validate minimum path segments: tenant, package, entity
  if (slug.length < 3) {
    return { 
      error: 'Invalid route: expected /api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]', 
      status: STATUS.BAD_REQUEST 
    }
  }
  
  const [tenant, packageId, entity, id, action] = slug
  
  if (tenant === undefined || tenant.length === 0) {
    return { error: 'Tenant is required', status: STATUS.BAD_REQUEST }
  }
  
  if (packageId === undefined || packageId.length === 0) {
    return { error: 'Package is required', status: STATUS.BAD_REQUEST }
  }
  
  if (entity === undefined || entity.length === 0) {
    return { error: 'Entity is required', status: STATUS.BAD_REQUEST }
  }
  
  // Determine operation from HTTP method and path structure
  let operation = 'unknown'
  
  if (action !== undefined && action.length > 0) {
    // Custom action like POST /posts/123/like
    operation = action
  } else if (id !== undefined && id.length > 0) {
    // Operation on specific record
    if (method === 'GET') operation = 'read'
    else if (method === 'PUT' || method === 'PATCH') operation = 'update'
    else if (method === 'DELETE') operation = 'delete'
  } else {
    // Collection operation
    if (method === 'GET') operation = 'list'
    else if (method === 'POST') operation = 'create'
  }
  
  // Build DBAL operation object
  const dbalOp = {
    entity,
    operation,
    id,
    action,
  }
  
  return {
    route: {
      tenant,
      package: packageId,
      entity,
      id,
      action,
    },
    operation,
    dbalOp,
  }
}

export function executeDbalOperation(
  _op: unknown,
  _context?: unknown
): Promise<{ success: boolean; data?: unknown; error?: string; meta?: unknown }> {
  // TODO: Implement DBAL operation execution
  return Promise.resolve({ success: false, error: 'Not implemented' })
}

export function executePackageAction(
  _packageId: unknown,
  _entity: unknown,
  _action: unknown,
  _id: unknown,
  _context?: unknown
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  // TODO: Implement package action execution
  return Promise.resolve({ success: false, error: 'Not implemented' })
}

export interface TenantValidationResult {
  allowed: boolean
  reason?: string
  tenant?: unknown
}

export function validateTenantAccess(
  _user: unknown,
  _tenant: unknown,
  _minLevel: unknown
): Promise<TenantValidationResult> {
  // TODO: Implement tenant access validation
  return Promise.resolve({ allowed: false, reason: 'Not implemented' })
}

// Re-export auth functions
export { validatePackageRoute, canBePrimaryPackage, loadPackageMetadata } from './auth/validate-package-route'
export type { RouteValidationResult } from './auth/validate-package-route'

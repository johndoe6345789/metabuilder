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
  dbalOp: {
    entity: string
    operation: string
    id?: string
    action?: string
  }
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
    operation = 'action'
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

function resolveTenantId(context?: {
  tenantId?: string
  tenant?: { id?: string | null }
}): string | undefined {
  if (typeof context?.tenantId === 'string' && context.tenantId.length > 0) {
    return context.tenantId
  }

  const tenantId = context?.tenant?.id
  if (typeof tenantId === 'string' && tenantId.length > 0) {
    return tenantId
  }

  return undefined
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export async function executeDbalOperation(
  op: { entity: string; operation: string; id?: string; action?: string },
  context?: {
    tenantId?: string
    userId?: string
    tenant?: { id?: string | null }
    user?: { id?: string | null }
    body?: unknown
  }
): Promise<{ success: boolean; data?: unknown; error?: string; meta?: unknown }> {
  const { db } = await import('@/lib/db-client')

  try {
    const { entity, operation, id } = op
    const tenantId = resolveTenantId(context)
    const filter = tenantId !== undefined ? { tenantId } : {}
    const ops = db.entity(entity)

    switch (operation) {
      case 'list': {
        const result = await ops.list({ filter })
        return { success: true, data: result.data, meta: { count: result.data.length } }
      }
      case 'read': {
        if (id === undefined || id.length === 0) return { success: false, error: 'ID required for read operation' }
        const record = await ops.read(id)
        if (record === null) return { success: false, error: 'Record not found' }
        return { success: true, data: record }
      }
      case 'create': {
        const body = context?.body
        if (!isPlainObject(body)) return { success: false, error: 'Body required for create operation' }
        const data = { ...body, ...(tenantId !== undefined ? { tenantId } : {}) }
        const created = await ops.create(data)
        return { success: true, data: created }
      }
      case 'update': {
        if (id === undefined || id.length === 0) return { success: false, error: 'ID required for update operation' }
        const body = context?.body
        if (!isPlainObject(body)) return { success: false, error: 'Body required for update operation' }
        if (tenantId !== undefined) {
          const existing = await ops.read(id)
          if (existing === null) return { success: false, error: 'Record not found' }
        }
        const data = { ...body, ...(tenantId !== undefined ? { tenantId } : {}) }
        const updated = await ops.update(id, data)
        return { success: true, data: updated }
      }
      case 'delete': {
        if (id === undefined || id.length === 0) return { success: false, error: 'ID required for delete operation' }
        if (tenantId !== undefined) {
          const existing = await ops.read(id)
          if (existing === null) return { success: false, error: 'Record not found' }
        }
        const deleted = await ops.remove(id)
        if (!deleted) return { success: false, error: 'Record not found' }
        return { success: true, data: { deleted: id } }
      }
      default:
        return { success: false, error: `Unknown operation: ${operation}` }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Operation failed' }
  }
}

export async function executePackageAction(
  packageId: string,
  entity: string,
  action: string,
  id: string | undefined,
  context?: {
    tenantId?: string
    userId?: string
    tenant?: { id?: string | null }
    user?: { id?: string | null }
    body?: unknown
  },
  options?: { allowFallback?: boolean }
): Promise<{ success: boolean; data?: unknown; error?: string; code?: 'NOT_FOUND' | 'INVALID_CONFIG' }> {
  // Package actions are custom operations defined by packages
  // Load package config and execute the registered action handler
  try {
    const { db } = await import('@/lib/db-client')

    // Get package configuration
    const pkgResult = await db.installedPackages.list({ filter: { packageId, enabled: true } })
    const pkg = pkgResult.data[0] ?? null
    
    if (pkg === null || pkg === undefined) {
      return options?.allowFallback === true
        ? { success: false, code: 'NOT_FOUND' }
        : { success: false, error: `Package not found or disabled: ${packageId}`, code: 'NOT_FOUND' }
    }
    
    // Parse package config for custom actions
    let config: { actions?: Record<string, { handler?: string }> } = {}
    try {
      config = JSON.parse((pkg as { config?: string }).config ?? '{}') as {
        actions?: Record<string, { handler?: string }>
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Invalid package config', code: 'INVALID_CONFIG' }
    }
    
    const actionConfig = config.actions?.[`${entity}.${action}`]
    
    if (actionConfig === undefined) {
      return options?.allowFallback === true
        ? { success: false, code: 'NOT_FOUND' }
        : { success: false, error: `Action not found: ${entity}.${action}`, code: 'NOT_FOUND' }
    }
    
    // For now, return success with action metadata
    // Full implementation would dynamically load and execute the handler
    return { 
      success: true, 
      data: { 
        action: `${entity}.${action}`,
        entityId: id,
        packageId,
        tenantId: resolveTenantId(context),
      } 
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Action failed' }
  }
}

export interface TenantValidationResult {
  allowed: boolean
  reason?: string
  tenant?: unknown
}

export async function validateTenantAccess(
  user: { id: string; role: string; tenantId?: string | null } | null,
  tenantSlug: string,
  minLevel: number = 1
): Promise<TenantValidationResult> {
  // Import centralized role levels
  const { getRoleLevel, ROLE_LEVELS } = await import('@/lib/constants')
  
  // No user means public access only
  if (user === null) {
    if (minLevel <= 0) {
      return { allowed: true }
    }
    return { allowed: false, reason: 'Authentication required' }
  }
  
  const userLevel = getRoleLevel(user.role)
  
  // Check permission level
  if (userLevel < minLevel) {
    return { allowed: false, reason: `Insufficient permissions. Required level: ${minLevel}, your level: ${userLevel}` }
  }
  
  // God and supergod can access any tenant
  if (userLevel >= ROLE_LEVELS.god) {
    return { allowed: true }
  }
  
  // For lower levels, verify tenant membership
  try {
    const { db } = await import('@/lib/db-client')

    const tenantResult = await db.entity('Tenant').list({ filter: { slug: tenantSlug } })
    const tenant = tenantResult.data[0] ?? null
    
    if (tenant === null || tenant === undefined) {
      return { allowed: false, reason: `Tenant not found: ${tenantSlug}` }
    }
    
    const tenantId = (tenant as { id: string }).id
    
    // Check if user belongs to this tenant
    if (user.tenantId !== tenantId) {
      return { allowed: false, reason: 'Not a member of this tenant' }
    }
    
    return { allowed: true, tenant }
  } catch (error) {
    return { allowed: false, reason: error instanceof Error ? error.message : 'Validation failed' }
  }
}

// Re-export auth functions
export { validatePackageRoute, canBePrimaryPackage, loadPackageMetadata } from './auth/validate-package-route'
export type { RouteValidationResult } from './auth/validate-package-route'

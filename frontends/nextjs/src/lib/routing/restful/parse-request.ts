/**
 * A versioned API path split into the parts a handler needs.
 *
 * /api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]
 */

import { STATUS } from '..'
import { operationFor, type Operation } from './operation'

export interface RestfulRoute {
  tenant: string
  package: string
  entity: string
  id?: string
  action?: string
}

export interface RestfulContext {
  route: RestfulRoute
  operation: Operation
  dbalOp: {
    entity: string
    operation: Operation
    id?: string
    action?: string
  }
}

export interface RestfulError {
  error: string
  status: number
}

const PATH_SHAPE =
  'Invalid route: expected /api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]'

/** Names the first missing segment, so the caller learns what to fix. */
function missingSegment(
  tenant?: string,
  packageId?: string,
  entity?: string
): string | null {
  if (tenant === undefined || tenant.length === 0) return 'Tenant is required'
  if (packageId === undefined || packageId.length === 0) {
    return 'Package is required'
  }
  if (entity === undefined || entity.length === 0) return 'Entity is required'
  return null
}

export function parseRestfulRequest(
  req: { method: string },
  params: { slug: string[] }
): RestfulContext | RestfulError {
  const { slug } = params
  if (slug.length < 3) {
    return { error: PATH_SHAPE, status: STATUS.BAD_REQUEST }
  }

  const [tenant, packageId, entity, id, action] = slug
  const missing = missingSegment(tenant, packageId, entity)
  if (missing !== null) {
    return { error: missing, status: STATUS.BAD_REQUEST }
  }

  const operation = operationFor(req.method, id, action)
  return {
    route: {
      tenant: tenant as string,
      package: packageId as string,
      entity: entity as string,
      id,
      action,
    },
    operation,
    dbalOp: { entity: entity as string, operation, id, action },
  }
}

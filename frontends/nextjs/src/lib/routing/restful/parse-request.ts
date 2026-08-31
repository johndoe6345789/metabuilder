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

  // .at() is typed `string | undefined` under both tsconfig variants
  // (unlike destructuring from `string[]`, whose element type depends on
  // noUncheckedIndexedAccess), so the undefined checks below are real
  // narrowing everywhere rather than an assertion needed only in strict.
  const tenant = slug.at(0)
  const packageId = slug.at(1)
  const entity = slug.at(2)
  const id = slug.at(3)
  const action = slug.at(4)

  const missing = missingSegment(tenant, packageId, entity)
  if (missing !== null) {
    return { error: missing, status: STATUS.BAD_REQUEST }
  }
  // missingSegment returning null guarantees these three are non-empty,
  // but that guarantee doesn't flow back through the function call.
  if (tenant === undefined || packageId === undefined || entity === undefined) {
    return { error: PATH_SHAPE, status: STATUS.BAD_REQUEST }
  }

  const operation = operationFor(req.method, id, action)
  return {
    route: { tenant, package: packageId, entity, id, action },
    operation,
    dbalOp: { entity, operation, id, action },
  }
}

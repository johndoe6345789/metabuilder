/**
 * Validate package route (stub)
 */

export interface RouteValidationResult {
  allowed: boolean
  error?: string
  reason?: string
  package?: {
    name?: string
    minLevel?: number
  }
}

export function validatePackageRoute(
  _b_package: string,
  _b_entity: string,
  _userId?: unknown
): RouteValidationResult {
  // TODO: Implement route validation
  return { allowed: true }
}

export function canBePrimaryPackage(_b_packageId: string): boolean {
  // TODO: Implement primary package check
  return true
}

export function loadPackageMetadata(_b_packageId: string): unknown {
  // TODO: Implement package metadata loading
  return null
}

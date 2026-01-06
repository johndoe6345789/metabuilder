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

export async function validatePackageRoute(
  _b_package: string,
  _b_entity: string,
  _userId?: unknown
): Promise<RouteValidationResult> {
  // TODO: Implement route validation
  return { allowed: true }
}

export async function canBePrimaryPackage(_b_packageId: string): Promise<boolean> {
  // TODO: Implement primary package check
  return true
}

export async function loadPackageMetadata(_b_packageId: string): Promise<unknown> {
  // TODO: Implement package metadata loading
  return null
}

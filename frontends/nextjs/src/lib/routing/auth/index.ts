/**
 * Routing auth exports
 */

export { getSessionUser, requireSession } from './get-session-user'
export type { SessionResult, SessionUser } from './get-session-user'

export { getUserTenants, validateTenantAccess } from './validate-tenant-access'
export type { TenantAccessResult, TenantInfo } from './validate-tenant-access'

export {
  clearPackageCache,
  getPackageEntities,
  getPackageRoutes,
  loadPackageMetadata,
  packageClaimsRoute,
  validatePackageRoute,
} from './validate-package-route'
export type { PackageMetadata, PackageRoute, RouteClaimResult } from './validate-package-route'

export { executeDbalOperation, executePackageAction } from './execute-dbal-operation'
export type { ExecuteOptions, ExecuteResult } from './execute-dbal-operation'

/**
 * Permission system exports
 */

export {
  checkAccess,
  checkPackagePermissions,
  checkComponentPermissions,
  getAccessibleComponents,
  getPermissionDenialMessage,
  roleToLevel,
  levelToRole,
  meetsLevelRequirement,
} from './check-package-permissions'

export type {
  PermissionLevel,
  ComponentPermission,
  PackagePermissions,
  PermissionCheckResult,
  PermissionContext,
} from './check-package-permissions'

export { PermissionManager } from './permission-manager'
export { usePermissions } from './use-permissions'

/**
 * Permission system exports
 */

export type {
  ComponentPermission,
  PackagePermissions,
  PermissionCheckResult,
  PermissionContext,
  PermissionLevel,
} from './check-package-permissions'
export {
  checkAccess,
  checkComponentPermissions,
  checkPackagePermissions,
  getAccessibleComponents,
  getPermissionDenialMessage,
  levelToRole,
  meetsLevelRequirement,
  roleToLevel,
} from './check-package-permissions'
export { PermissionManager } from './permission-manager'
export { usePermissions } from './use-permissions'

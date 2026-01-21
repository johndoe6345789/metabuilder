'use client'

/**
 * Package Admin Utilities & Handlers
 *
 * Central export point for all package management admin tools.
 */

// Re-export page handlers
export { createPackagePageHandlers } from './package-page-handlers'

// Re-export utilities
export {
  parseErrorCode,
  getErrorMessage,
  isRetryableError,
  formatPackageStatus,
  formatPackageCategory,
  formatVersion,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRating,
  getPlaceholderIconUrl,
  truncateText,
  filterPackagesBySearch,
  sortPackages,
  canInstallPackage,
  canUninstallPackage,
  canEnablePackage,
  canDisablePackage,
  getAvailableActions,
  validatePackageData,
  mergePackageUpdate,
  formatDependencies,
  areDependenciesMet,
  getMissingDependencies,
} from './package-utils'

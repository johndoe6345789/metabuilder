'use client'

import type {
  PackageInfo,
  PackageError,
  PackageErrorCode,
} from '@/lib/types/package-admin-types'

/**
 * Package Management Utilities
 *
 * Helper functions for:
 * - Error handling and parsing
 * - Data transformation
 * - Validation
 * - Display formatting
 */

/**
 * Parse error code from various error types
 */
export function parseErrorCode(error: unknown): PackageErrorCode {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return (error as PackageError).code
  }

  if (error instanceof Error) {
    if (error.message.includes('already installed')) {
      return 'ALREADY_INSTALLED' as PackageErrorCode
    }
    if (error.message.includes('not installed')) {
      return 'ALREADY_UNINSTALLED' as PackageErrorCode
    }
    if (error.message.includes('permission')) {
      return 'PERMISSION_DENIED' as PackageErrorCode
    }
    if (error.message.includes('dependency')) {
      return 'DEPENDENCY_ERROR' as PackageErrorCode
    }
    if (error.message.includes('not found')) {
      return 'PACKAGE_NOT_FOUND' as PackageErrorCode
    }
  }

  return 'UNKNOWN_ERROR' as PackageErrorCode
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: PackageError | Error | null): string {
  if (!error) {
    return 'An unknown error occurred'
  }

  if ('code' in error && typeof (error as PackageError).code === 'string') {
    const packageError = error as PackageError
    const messages: Record<string, string> = {
      NETWORK_ERROR: 'Network error. Please check your connection.',
      ALREADY_INSTALLED: 'This package is already installed.',
      ALREADY_UNINSTALLED: 'This package is not installed.',
      MISSING_DEPENDENCIES: 'Missing required dependencies. Please install them first.',
      PACKAGE_NOT_FOUND: 'Package not found.',
      PERMISSION_DENIED: "You don't have permission to perform this action.",
      DEPENDENCY_ERROR: 'Other packages depend on this package.',
      INVALID_PACKAGE_ID: 'Invalid package ID.',
      SERVER_ERROR: 'Server error. Please try again later.',
      UNKNOWN_ERROR: 'An unknown error occurred.',
    }

    return messages[(packageError as any).code] || error.message
  }

  return error.message || 'An unknown error occurred'
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: PackageError | Error | null): boolean {
  if (!error) {
    return false
  }

  if ('code' in error && typeof (error as PackageError).code === 'string') {
    const packageError = error as PackageError
    const retryableCodes = [
      'NETWORK_ERROR',
      'SERVER_ERROR',
    ]

    return retryableCodes.includes((packageError as any).code)
  }

  return false
}

/**
 * Format package status for display
 */
export function formatPackageStatus(status: string): string {
  const map: Record<string, string> = {
    installed: 'Installed',
    available: 'Available',
    disabled: 'Disabled',
  }

  return map[status] || status
}

/**
 * Format package category for display
 */
export function formatPackageCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format version string
 */
export function formatVersion(version: string): string {
  // Ensure version matches semver format
  const semverRegex = /^\d+\.\d+\.\d+/
  const match = version.match(semverRegex)
  return match ? match[0] : version
}

/**
 * Format date to human-readable string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date with time
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format large numbers (download count, etc.)
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return String(num)
}

/**
 * Format rating to display string
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Generate placeholder avatar URL
 */
export function getPlaceholderIconUrl(packageId: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(packageId)}&background=random`
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.substring(0, maxLength)}...`
}

/**
 * Filter packages by search term
 */
export function filterPackagesBySearch(
  packages: PackageInfo[],
  searchTerm: string
): PackageInfo[] {
  if (!searchTerm.trim()) {
    return packages
  }

  const term = searchTerm.toLowerCase()
  return packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(term) ||
      pkg.description.toLowerCase().includes(term) ||
      pkg.author.toLowerCase().includes(term) ||
      pkg.tags.some((tag) => tag.toLowerCase().includes(term))
  )
}

/**
 * Sort packages by field
 */
export function sortPackages(
  packages: PackageInfo[],
  sortBy: 'name' | 'rating' | 'downloads' | 'date',
  ascending = true
): PackageInfo[] {
  const sorted = [...packages]

  sorted.sort((a, b) => {
    let aVal: any
    let bVal: any

    switch (sortBy) {
      case 'name':
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
        break
      case 'rating':
        aVal = a.rating
        bVal = b.rating
        break
      case 'downloads':
        aVal = a.downloadCount
        bVal = b.downloadCount
        break
      case 'date':
        aVal = a.updatedAt
        bVal = b.updatedAt
        break
      default:
        return 0
    }

    if (aVal < bVal) {
      return ascending ? -1 : 1
    }
    if (aVal > bVal) {
      return ascending ? 1 : -1
    }
    return 0
  })

  return sorted
}

/**
 * Check if package can be installed
 */
export function canInstallPackage(pkg: PackageInfo): boolean {
  return pkg.status === 'available' && !pkg.enabled
}

/**
 * Check if package can be uninstalled
 */
export function canUninstallPackage(pkg: PackageInfo): boolean {
  return pkg.status === 'installed' || pkg.status === 'disabled'
}

/**
 * Check if package can be enabled
 */
export function canEnablePackage(pkg: PackageInfo): boolean {
  return pkg.status === 'installed' && !pkg.enabled
}

/**
 * Check if package can be disabled
 */
export function canDisablePackage(pkg: PackageInfo): boolean {
  return pkg.status === 'installed' && pkg.enabled
}

/**
 * Get available actions for a package
 */
export function getAvailableActions(pkg: PackageInfo): Array<'install' | 'uninstall' | 'enable' | 'disable'> {
  const actions: Array<'install' | 'uninstall' | 'enable' | 'disable'> = []

  if (canInstallPackage(pkg)) {
    actions.push('install')
  }
  if (canUninstallPackage(pkg)) {
    actions.push('uninstall')
  }
  if (canEnablePackage(pkg)) {
    actions.push('enable')
  }
  if (canDisablePackage(pkg)) {
    actions.push('disable')
  }

  return actions
}

/**
 * Validate package data
 */
export function validatePackageData(pkg: Partial<PackageInfo>): string[] {
  const errors: string[] = []

  if (!pkg.id || typeof pkg.id !== 'string') {
    errors.push('Invalid package ID')
  }
  if (!pkg.name || typeof pkg.name !== 'string') {
    errors.push('Invalid package name')
  }
  if (!pkg.version || typeof pkg.version !== 'string') {
    errors.push('Invalid version')
  }
  if (typeof pkg.rating !== 'number' || pkg.rating < 0 || pkg.rating > 5) {
    errors.push('Invalid rating')
  }

  return errors
}

/**
 * Merge package list with updates
 */
export function mergePackageUpdate(
  packages: PackageInfo[],
  updated: PackageInfo
): PackageInfo[] {
  return packages.map((pkg) => (pkg.id === updated.id ? updated : pkg))
}

/**
 * Get dependencies display string
 */
export function formatDependencies(dependencies: string[]): string {
  if (!dependencies || dependencies.length === 0) {
    return 'None'
  }
  return dependencies.join(', ')
}

/**
 * Check if dependencies are met
 */
export function areDependenciesMet(
  dependencies: string[],
  installedPackageIds: Set<string>
): boolean {
  return dependencies.every((dep) => installedPackageIds.has(dep))
}

/**
 * Get missing dependencies
 */
export function getMissingDependencies(
  dependencies: string[],
  installedPackageIds: Set<string>
): string[] {
  return dependencies.filter((dep) => !installedPackageIds.has(dep))
}

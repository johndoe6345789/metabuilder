import type { PackageDefinition, PackageRegistry } from '../types'

/**
 * Filter packages by user permission level
 * Returns only packages the user has access to based on minLevel
 */
export function getAccessiblePackages(
  registry: PackageRegistry,
  userLevel: number
): PackageRegistry {
  const accessibleRegistry: PackageRegistry = {}

  for (const [packageId, pkg] of Object.entries(registry)) {
    if (pkg.minLevel <= userLevel) {
      accessibleRegistry[packageId] = pkg
    }
  }

  return accessibleRegistry
}

/**
 * Check if a user can access a specific package
 */
export function canAccessPackage(
  pkg: PackageDefinition,
  userLevel: number
): boolean {
  return pkg.minLevel <= userLevel
}

/**
 * Get packages grouped by permission level
 */
export function getPackagesByLevel(registry: PackageRegistry): Record<number, PackageDefinition[]> {
  const grouped: Record<number, PackageDefinition[]> = {
    1: [], // Public
    2: [], // User
    3: [], // Moderator
    4: [], // Admin
    5: [], // God
    6: [], // Supergod
  }

  for (const pkg of Object.values(registry)) {
    const level = pkg.minLevel ?? 1
    if (!grouped[level]) {
      grouped[level] = []
    }
    grouped[level].push(pkg)
  }

  return grouped
}

/**
 * Unified Package Loader
 *
 * Single entry point for loading packages from:
 * 1. Filesystem JSON packages (packages/ folder with package.json + components/ui.json)
 * 2. Legacy in-memory PACKAGE_CATALOG (hardcoded TypeScript definitions)
 *
 * This is the CANONICAL way to load packages in the Next.js frontend.
 * Do not use load-json-package.ts or PACKAGE_CATALOG directly.
 */

import { join } from 'path'
import { PACKAGE_CATALOG, type PackageCatalogData } from './core/package-catalog'
import {
  loadJSONPackage,
  loadAllJSONPackages,
  type JSONPackage,
  type JSONPackageMetadata,
} from './json/load-json-package'

// Re-export types for convenience
export type { JSONPackage, JSONPackageMetadata, PackageCatalogData }

/**
 * Unified package representation that works for both JSON and legacy packages
 */
export interface UnifiedPackage {
  packageId: string
  name: string
  version: string
  description: string
  category?: string
  minLevel?: number
  source: 'json' | 'legacy'
  // Original data for advanced use cases
  jsonData?: JSONPackage
  legacyData?: PackageCatalogData
}

/**
 * Get the packages directory path (relative to project root)
 */
export function getPackagesDir(): string {
  return join(process.cwd(), 'packages')
}

/**
 * Load a single package by ID
 * First tries JSON filesystem, falls back to legacy catalog
 */
export async function loadPackage(packageId: string): Promise<UnifiedPackage | null> {
  // Try JSON filesystem first
  try {
    const packagePath = join(getPackagesDir(), packageId)
    const jsonPkg = await loadJSONPackage(packagePath)

    return {
      packageId: jsonPkg.metadata.packageId,
      name: jsonPkg.metadata.name,
      version: jsonPkg.metadata.version,
      description: jsonPkg.metadata.description,
      category: jsonPkg.metadata.category,
      minLevel: jsonPkg.metadata.minLevel,
      source: 'json',
      jsonData: jsonPkg,
    }
  } catch {
    // JSON package not found, try legacy catalog
  }

  // Try legacy PACKAGE_CATALOG
  const legacyEntry = PACKAGE_CATALOG[packageId]
  if (legacyEntry) {
    const data = legacyEntry()
    return {
      packageId: data.manifest.packageId,
      name: data.manifest.name,
      version: data.manifest.version,
      description: data.manifest.description,
      category: data.manifest.category,
      minLevel: data.manifest.minLevel,
      source: 'legacy',
      legacyData: data,
    }
  }

  return null
}

/**
 * Load all available packages from both sources
 */
export async function loadAllPackages(): Promise<UnifiedPackage[]> {
  const packages: UnifiedPackage[] = []
  const seenIds = new Set<string>()

  // Load JSON packages first (they take priority)
  try {
    const jsonPackages = await loadAllJSONPackages(getPackagesDir())
    for (const jsonPkg of jsonPackages) {
      const id = jsonPkg.metadata.packageId
      if (!seenIds.has(id)) {
        seenIds.add(id)
        packages.push({
          packageId: id,
          name: jsonPkg.metadata.name,
          version: jsonPkg.metadata.version,
          description: jsonPkg.metadata.description,
          category: jsonPkg.metadata.category,
          minLevel: jsonPkg.metadata.minLevel,
          source: 'json',
          jsonData: jsonPkg,
        })
      }
    }
  } catch (error) {
    console.warn('Failed to load JSON packages:', error)
  }

  // Add legacy packages that aren't already loaded from JSON
  for (const [packageId, entry] of Object.entries(PACKAGE_CATALOG)) {
    if (!seenIds.has(packageId)) {
      seenIds.add(packageId)
      const data = entry()
      packages.push({
        packageId: data.manifest.packageId,
        name: data.manifest.name,
        version: data.manifest.version,
        description: data.manifest.description,
        category: data.manifest.category,
        minLevel: data.manifest.minLevel,
        source: 'legacy',
        legacyData: data,
      })
    }
  }

  return packages
}

/**
 * Get package metadata only (lightweight, no components)
 */
export async function getPackageMetadata(
  packageId: string
): Promise<{ name: string; description: string; version: string } | null> {
  const pkg = await loadPackage(packageId)
  if (!pkg) return null

  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
  }
}

/**
 * Check if a package exists
 */
export async function packageExists(packageId: string): Promise<boolean> {
  const pkg = await loadPackage(packageId)
  return pkg !== null
}

/**
 * List all available package IDs
 */
export async function listPackageIds(): Promise<string[]> {
  const packages = await loadAllPackages()
  return packages.map(p => p.packageId)
}

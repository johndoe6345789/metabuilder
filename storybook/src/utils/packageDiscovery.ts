/**
 * Package Discovery System
 *
 * Automatically discovers all packages in /packages folder
 * and loads their styles and components dynamically
 */

export interface PackageMetadata {
  id: string
  name: string
  description: string
  version: string
  level?: number
  seed?: {
    styles?: string
    components?: string
  }
}

export interface DiscoveredPackage {
  id: string
  metadata: PackageMetadata
  hasStyles: boolean
  hasComponents: boolean
}

/**
 * Discover all packages by scanning the packages folder
 */
export async function discoverAllPackages(): Promise<DiscoveredPackage[]> {
  try {
    // Fetch the package list from a generated index
    // We'll need to generate this during build
    const response = await fetch('/packages/package-index.json')

    if (!response.ok) {
      // Fallback: hardcoded list of known packages
      return getKnownPackages()
    }

    const packageIds: string[] = await response.json()

    const packages = await Promise.all(
      packageIds.map(async (id) => {
        try {
          const metadataResponse = await fetch(`/packages/${id}/seed/metadata.json`)
          const metadata: PackageMetadata = await metadataResponse.json()

          return {
            id,
            metadata,
            hasStyles: !!metadata.seed?.styles,
            hasComponents: !!metadata.seed?.components
          }
        } catch (error) {
          console.warn(`Failed to load metadata for ${id}`)
          return null
        }
      })
    )

    return packages.filter((pkg): pkg is DiscoveredPackage => pkg !== null)
  } catch (error) {
    console.error('Package discovery failed:', error)
    return getKnownPackages()
  }
}

/**
 * Get hardcoded list of known packages as fallback
 */
function getKnownPackages(): DiscoveredPackage[] {
  const knownPackageIds = [
    'shared',
    'ui_home',
    'ui_header',
    'ui_footer',
    'ui_level2',
    'ui_level3',
    'ui_level4',
    'ui_level5',
    'ui_level6',
    'admin_panel',
    'code_editor',
    'css_designer',
  ]

  return knownPackageIds.map(id => ({
    id,
    metadata: {
      id,
      name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `${id} package`,
      version: '1.0.0',
      seed: {
        styles: 'seed/styles.json',
        components: 'seed/components.json'
      }
    },
    hasStyles: true,
    hasComponents: true
  }))
}

/**
 * Discover packages with styles
 */
export async function discoverPackagesWithStyles(): Promise<string[]> {
  const packages = await discoverAllPackages()
  return packages
    .filter(pkg => pkg.hasStyles)
    .map(pkg => pkg.id)
}

/**
 * Discover packages with components
 */
export async function discoverPackagesWithComponents(): Promise<string[]> {
  const packages = await discoverAllPackages()
  return packages
    .filter(pkg => pkg.hasComponents)
    .map(pkg => pkg.id)
}

/**
 * Group packages by level
 */
export async function getPackagesByLevel(): Promise<Record<number, DiscoveredPackage[]>> {
  const packages = await discoverAllPackages()

  return packages.reduce((acc, pkg) => {
    const level = pkg.metadata.level || 0
    if (!acc[level]) {
      acc[level] = []
    }
    acc[level].push(pkg)
    return acc
  }, {} as Record<number, DiscoveredPackage[]>)
}

/**
 * Package Discovery System
 *
 * Automatically discovers all packages in /packages folder
 * and loads their metadata, components, permissions, and other resources
 * in the new pure JSON format
 */

export interface PackageMetadata {
  packageId: string
  name: string
  description: string
  version: string
  author?: string
  license?: string
  category?: string
  icon?: string
  minLevel?: number
  primary?: boolean
  dependencies?: Record<string, string>
  exports?: {
    components?: string[]
    scripts?: string[]
    types?: string[]
  }
  storybook?: {
    featured?: boolean
    excludeFromDiscovery?: boolean
    stories?: any[]
  }
}

export interface ComponentDefinition {
  id: string
  name: string
  description?: string
  props?: any[]
  render?: any
}

export interface PermissionDefinition {
  id: string
  name: string
  description: string
  resource: string
  action: string
  scope?: string
  minLevel?: number
}

export interface DiscoveredPackage {
  id: string
  metadata: PackageMetadata
  hasComponents: boolean
  hasPermissions: boolean
  hasStyles: boolean
  hasStorybook: boolean
  components?: ComponentDefinition[]
  permissions?: PermissionDefinition[]
}

/**
 * Discover all packages by loading their package.json files
 */
export async function discoverAllPackages(): Promise<DiscoveredPackage[]> {
  try {
    // Try to load from a build-time generated index
    const indexResponse = await fetch('/packages-index.json')

    let packageIds: string[] = []

    if (indexResponse.ok) {
      const indexData = await indexResponse.json()
      packageIds = indexData.packages || []
    } else {
      // Fallback: try to discover packages dynamically
      packageIds = await discoverPackageIds()
    }

    const packages = await Promise.all(
      packageIds.map(async (id) => {
        try {
          return await loadPackage(id)
        } catch (error) {
          console.warn(`Failed to load package ${id}:`, error)
          return null
        }
      })
    )

    return packages.filter((pkg): pkg is DiscoveredPackage => pkg !== null)
  } catch (error) {
    console.error('Package discovery failed:', error)
    return []
  }
}

/**
 * Load a single package by its ID
 */
export async function loadPackage(packageId: string): Promise<DiscoveredPackage> {
  // Load package.json metadata
  const metadataResponse = await fetch(`/packages/${packageId}/package.json`)
  if (!metadataResponse.ok) {
    throw new Error(`Failed to load package.json for ${packageId}`)
  }
  const metadata: PackageMetadata = await metadataResponse.json()

  // Check for components
  let components: ComponentDefinition[] | undefined
  let hasComponents = false
  try {
    const componentsResponse = await fetch(`/packages/${packageId}/components/ui.json`)
    if (componentsResponse.ok) {
      const componentsData = await componentsResponse.json()
      components = componentsData.components || []
      hasComponents = components.length > 0
    }
  } catch (error) {
    // Components file doesn't exist, that's okay
  }

  // Check for permissions
  let permissions: PermissionDefinition[] | undefined
  let hasPermissions = false
  try {
    const permissionsResponse = await fetch(`/packages/${packageId}/permissions/roles.json`)
    if (permissionsResponse.ok) {
      const permissionsData = await permissionsResponse.json()
      permissions = permissionsData.permissions || []
      hasPermissions = permissions.length > 0
    }
  } catch (error) {
    // Permissions file doesn't exist, that's okay
  }

  // Check for styles
  let hasStyles = false
  try {
    const stylesResponse = await fetch(`/packages/${packageId}/styles/index.json`)
    hasStyles = stylesResponse.ok
  } catch (error) {
    // Styles don't exist, that's okay
  }

  // Check storybook configuration
  const hasStorybook = !!(metadata.storybook && !metadata.storybook.excludeFromDiscovery)

  return {
    id: packageId,
    metadata,
    hasComponents,
    hasPermissions,
    hasStyles,
    hasStorybook,
    components,
    permissions,
  }
}

/**
 * Dynamically discover package IDs from known locations
 * This is a fallback when no build-time index exists
 */
async function discoverPackageIds(): Promise<string[]> {
  // In a browser environment, we can't scan directories
  // Return a hardcoded fallback list
  return getKnownPackageIds()
}

/**
 * Get hardcoded list of known package IDs as fallback
 */
function getKnownPackageIds(): string[] {
  return [
    'admin_dialog',
    'arcade_lobby',
    'audit_log',
    'code_editor',
    'codegen_studio',
    'config_summary',
    'css_designer',
    'dashboard',
    'data_table',
    'dbal_demo',
    'form_builder',
    'forum_forge',
    'github_tools',
    'irc_webchat',
    'json_script_example',
    'testing',
    'media_center',
    'nav_menu',
    'notification_center',
    'package_validator',
    'quick_guide',
    'role_editor',
    'schema_editor',
    'screenshot_analyzer',
    'smtp_config',
    'social_hub',
    'stats_grid',
    'stream_cast',
    'ui_auth',
    'ui_dialogs',
    'ui_footer',
    'ui_header',
    'ui_home',
    'ui_intro',
    'ui_level2',
    'ui_level3',
    'ui_level4',
    'ui_level5',
    'ui_level6',
    'ui_login',
    'ui_pages',
    'ui_permissions',
    'user_manager',
    'workflow_editor',
  ]
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
 * Discover packages with permissions
 */
export async function discoverPackagesWithPermissions(): Promise<string[]> {
  const packages = await discoverAllPackages()
  return packages
    .filter(pkg => pkg.hasPermissions)
    .map(pkg => pkg.id)
}

/**
 * Discover packages with Storybook configuration
 */
export async function discoverPackagesWithStorybook(): Promise<DiscoveredPackage[]> {
  const packages = await discoverAllPackages()
  return packages.filter(pkg => pkg.hasStorybook)
}

/**
 * Group packages by category
 */
export async function getPackagesByCategory(): Promise<Record<string, DiscoveredPackage[]>> {
  const packages = await discoverAllPackages()

  return packages.reduce((acc, pkg) => {
    const category = pkg.metadata.category || 'uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(pkg)
    return acc
  }, {} as Record<string, DiscoveredPackage[]>)
}

/**
 * Group packages by minimum level
 */
export async function getPackagesByLevel(): Promise<Record<number, DiscoveredPackage[]>> {
  const packages = await discoverAllPackages()

  return packages.reduce((acc, pkg) => {
    const level = pkg.metadata.minLevel || 0
    if (!acc[level]) {
      acc[level] = []
    }
    acc[level].push(pkg)
    return acc
  }, {} as Record<number, DiscoveredPackage[]>)
}

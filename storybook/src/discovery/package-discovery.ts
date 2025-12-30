/**
 * Package Discovery
 * 
 * Reads package metadata from packages/index.json and script manifests
 * to auto-populate Storybook with all available Lua packages.
 */

import type { LuaPackageMetadata, LuaRenderContext } from '../types/lua-types'

export interface StorybookConfig {
  packagesPath: string
  packagesIndex: string
  discovery: {
    enabled: boolean
    scanManifests: boolean
    includedCategories: string[]
    excludedPackages: string[]
    minLevel: number
    maxLevel: number
  }
  rendering: {
    defaultContext: LuaRenderContext
    contextVariants: Array<{
      name: string
      context: Partial<LuaRenderContext>
    }>
  }
  scripts: {
    renderFunctions: string[]
    ignoredScripts: string[]
  }
  manualOverrides: Record<string, {
    featured?: boolean
    renders?: Record<string, { description?: string }>
  }>
}

export interface DiscoveredPackage {
  metadata: LuaPackageMetadata
  scripts: DiscoveredScript[]
  featured: boolean
}

export interface DiscoveredScript {
  file: string
  name: string
  category?: string
  description?: string
  hasRenderFunction: boolean
}

export interface PackageIndex {
  generatedAt: string
  packages: LuaPackageMetadata[]
}

// Cache for loaded data
let configCache: StorybookConfig | null = null
let packagesCache: DiscoveredPackage[] | null = null

/**
 * Load the storybook config
 */
export async function loadConfig(): Promise<StorybookConfig> {
  if (configCache) return configCache
  
  const response = await fetch('/storybook.config.json')
  configCache = await response.json()
  return configCache!
}

/**
 * Load the packages index
 */
export async function loadPackagesIndex(): Promise<PackageIndex> {
  const response = await fetch('/packages/index.json')
  return await response.json()
}

/**
 * Load script manifest for a package
 */
export async function loadScriptManifest(packageId: string): Promise<DiscoveredScript[]> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/scripts/manifest.json`)
    if (!response.ok) return []
    const manifest = await response.json()
    return manifest.scripts || []
  } catch {
    return []
  }
}

/**
 * Discover all packages based on config
 */
export async function discoverPackages(): Promise<DiscoveredPackage[]> {
  if (packagesCache) return packagesCache
  
  const config = await loadConfig()
  const index = await loadPackagesIndex()
  
  const discovered: DiscoveredPackage[] = []
  
  for (const pkg of index.packages) {
    // Apply filters
    if (config.discovery.excludedPackages.includes(pkg.packageId)) continue
    if (pkg.minLevel < config.discovery.minLevel) continue
    if (pkg.minLevel > config.discovery.maxLevel) continue
    if (!config.discovery.includedCategories.includes(pkg.category)) continue
    
    // Load script manifest if enabled
    let scripts: DiscoveredScript[] = []
    if (config.discovery.scanManifests) {
      scripts = await loadScriptManifest(pkg.packageId)
      
      // Filter out ignored scripts
      scripts = scripts.filter(s => 
        !config.scripts.ignoredScripts.some(ignored => 
          s.name.includes(ignored) || s.file.includes(ignored)
        )
      )
      
      // Mark scripts that likely have render functions
      scripts = scripts.map(s => ({
        ...s,
        hasRenderFunction: config.scripts.renderFunctions.some(fn => 
          s.name === fn || s.file.includes(fn)
        )
      }))
    }
    
    // Check for manual overrides
    const override = config.manualOverrides[pkg.packageId]
    
    discovered.push({
      metadata: pkg,
      scripts,
      featured: override?.featured || false,
    })
  }
  
  // Sort: featured first, then by name
  discovered.sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return a.metadata.name.localeCompare(b.metadata.name)
  })
  
  packagesCache = discovered
  return discovered
}

/**
 * Get all context variants from config
 */
export async function getContextVariants(): Promise<Array<{ name: string; context: LuaRenderContext }>> {
  const config = await loadConfig()
  
  return config.rendering.contextVariants.map(variant => ({
    name: variant.name,
    context: {
      ...config.rendering.defaultContext,
      ...variant.context,
      user: {
        ...config.rendering.defaultContext.user,
        ...variant.context.user,
      },
    } as LuaRenderContext,
  }))
}

/**
 * Get default context
 */
export async function getDefaultContext(): Promise<LuaRenderContext> {
  const config = await loadConfig()
  return config.rendering.defaultContext
}

/**
 * Clear caches (useful for hot reloading)
 */
export function clearCaches(): void {
  configCache = null
  packagesCache = null
}

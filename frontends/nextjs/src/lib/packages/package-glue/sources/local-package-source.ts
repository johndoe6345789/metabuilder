import type {
  PackageSource,
  PackageSourceConfig,
  PackageIndexEntry,
  PackageData,
} from './package-source-types'
import { DEFAULT_LOCAL_SOURCE } from './package-source-types'
import { loadPackageSeedJson } from '../scripts/load-package-seed-json'
import { loadLuaScript } from '../scripts/load-lua-script'
import { loadLuaScriptsFolder } from '../scripts/load-lua-scripts-folder'
import type { LuaScriptFile, PackageComponent, PackageExamples } from '../types'

/**
 * Package seed JSON structure
 */
interface PackageSeedJson {
  metadata: {
    packageId: string
    name: string
    version: string
    description: string
    author: string
    category: string
    dependencies?: string[]
    minLevel?: number
    icon?: string
  }
  components?: PackageComponent[]
  examples?: PackageExamples
}

/**
 * Package index structure
 */
interface LocalPackageIndex {
  packages: Array<{
    packageId: string
    name: string
    version: string
    description: string
    author: string
    category: string
    dependencies?: string[]
    minLevel?: number
    icon?: string
  }>
}

/**
 * Local filesystem package source
 * Loads packages from the /packages directory
 */
export class LocalPackageSource implements PackageSource {
  private config: PackageSourceConfig
  private indexCache: PackageIndexEntry[] | null = null
  private packageCache: Map<string, PackageData> = new Map()

  constructor(config: Partial<PackageSourceConfig> = {}) {
    this.config = { ...DEFAULT_LOCAL_SOURCE, ...config }
  }

  getConfig(): PackageSourceConfig {
    return this.config
  }

  async fetchIndex(): Promise<PackageIndexEntry[]> {
    if (this.indexCache) {
      return this.indexCache
    }

    try {
      // Load the local package index
      const packageIndex = await this.loadLocalPackageIndex()
      
      // Convert to PackageIndexEntry format
      const entries: PackageIndexEntry[] = packageIndex.packages.map((pkg) => ({
        packageId: pkg.packageId,
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        author: pkg.author,
        category: pkg.category,
        dependencies: pkg.dependencies || [],
        minLevel: pkg.minLevel || 1,
        icon: pkg.icon,
        sourceId: this.config.id,
      }))

      this.indexCache = entries
      return entries
    } catch (error) {
      console.error('Failed to load local package index:', error)
      return []
    }
  }

  async loadPackage(packageId: string): Promise<PackageData | null> {
    // Check cache first
    if (this.packageCache.has(packageId)) {
      return this.packageCache.get(packageId)!
    }

    try {
      // Load metadata from seed/metadata.json
      const seedJson = await loadPackageSeedJson<PackageSeedJson | null>(
        packageId,
        'seed/metadata.json',
        null
      )
      if (!seedJson) {
        return null
      }

      // Load scripts
      const scriptFiles = await this.loadScriptFiles(packageId)
      const scriptsContent = await loadLuaScript(packageId)

      // Build package data
      const packageData: PackageData = {
        metadata: {
          packageId: seedJson.metadata.packageId,
          name: seedJson.metadata.name,
          version: seedJson.metadata.version,
          description: seedJson.metadata.description,
          author: seedJson.metadata.author,
          category: seedJson.metadata.category,
          dependencies: seedJson.metadata.dependencies || [],
          minLevel: seedJson.metadata.minLevel || 1,
          icon: seedJson.metadata.icon,
          sourceId: this.config.id,
        },
        components: seedJson.components || [],
        scripts: scriptsContent || undefined,
        scriptFiles,
        examples: seedJson.examples,
      }

      this.packageCache.set(packageId, packageData)
      return packageData
    } catch (error) {
      console.error(`Failed to load local package ${packageId}:`, error)
      return null
    }
  }

  async hasPackage(packageId: string): Promise<boolean> {
    const index = await this.fetchIndex()
    return index.some((entry) => entry.packageId === packageId)
  }

  async getVersions(packageId: string): Promise<string[]> {
    // Local source only has one version per package
    const index = await this.fetchIndex()
    const pkg = index.find((entry) => entry.packageId === packageId)
    return pkg ? [pkg.version] : []
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.indexCache = null
    this.packageCache.clear()
  }

  private async loadLocalPackageIndex(): Promise<LocalPackageIndex> {
    try {
      // Fetch from API endpoint
      const response = await fetch('/api/packages/index')
      if (response.ok) {
        return await response.json()
      }
    } catch {
      // Fallback: try direct fetch
      try {
        const response = await fetch('/packages/index.json')
        if (response.ok) {
          return await response.json()
        }
      } catch {
        // Ignore
      }
    }

    // Return empty if we can't load
    return { packages: [] }
  }

  private async loadScriptFiles(packageId: string): Promise<LuaScriptFile[]> {
    const scripts = loadLuaScriptsFolder(packageId)
    return scripts || []
  }
}

/**
 * Create a local package source with default configuration
 */
export const createLocalSource = (
  configOverrides?: Partial<PackageSourceConfig>
): LocalPackageSource => new LocalPackageSource(configOverrides)

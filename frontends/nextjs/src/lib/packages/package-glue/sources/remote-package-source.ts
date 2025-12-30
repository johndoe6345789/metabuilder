import type {
  PackageSource,
  PackageSourceConfig,
  PackageIndexEntry,
  PackageData,
} from './package-source-types'
import { DEFAULT_REMOTE_SOURCE } from './package-source-types'
import type { LuaScriptFile, PackageComponent, PackageExamples } from '../types'

/**
 * Remote package registry API response types
 */
interface RemotePackageIndexResponse {
  packages: PackageIndexEntry[]
  totalCount: number
  page: number
  pageSize: number
}

interface RemotePackageResponse {
  metadata: PackageIndexEntry
  components: PackageComponent[]
  scripts?: string
  scriptFiles: Array<{
    name: string
    path: string
    code: string
    category?: string
    description?: string
  }>
  examples?: PackageExamples
}

interface RemoteVersionsResponse {
  packageId: string
  versions: Array<{
    version: string
    publishedAt: string
    checksum: string
  }>
}

/**
 * Remote package source
 * Loads packages from a remote registry API
 */
export class RemotePackageSource implements PackageSource {
  private config: PackageSourceConfig
  private indexCache: PackageIndexEntry[] | null = null
  private packageCache: Map<string, PackageData> = new Map()
  private cacheExpiry: number = 5 * 60 * 1000 // 5 minutes
  private lastFetch: number = 0

  constructor(config: Partial<PackageSourceConfig> = {}) {
    this.config = { ...DEFAULT_REMOTE_SOURCE, ...config }
  }

  getConfig(): PackageSourceConfig {
    return this.config
  }

  async fetchIndex(): Promise<PackageIndexEntry[]> {
    // Check cache validity
    if (this.indexCache && Date.now() - this.lastFetch < this.cacheExpiry) {
      return this.indexCache
    }

    try {
      const response = await this.fetchWithAuth(`${this.config.url}/packages`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch package index: ${response.status}`)
      }

      const data: RemotePackageIndexResponse = await response.json()
      
      // Add sourceId to each entry
      const entries = data.packages.map((pkg) => ({
        ...pkg,
        sourceId: this.config.id,
      }))

      this.indexCache = entries
      this.lastFetch = Date.now()
      return entries
    } catch (error) {
      console.error('Failed to fetch remote package index:', error)
      // Return cached data if available, even if expired
      return this.indexCache || []
    }
  }

  async loadPackage(packageId: string, version?: string): Promise<PackageData | null> {
    const cacheKey = version ? `${packageId}@${version}` : packageId
    
    // Check cache first
    if (this.packageCache.has(cacheKey)) {
      return this.packageCache.get(cacheKey)!
    }

    try {
      const url = version
        ? `${this.config.url}/packages/${packageId}/versions/${version}`
        : `${this.config.url}/packages/${packageId}`
      
      const response = await this.fetchWithAuth(url)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to fetch package: ${response.status}`)
      }

      const data: RemotePackageResponse = await response.json()
      
      // Convert to PackageData format
      const packageData: PackageData = {
        metadata: {
          ...data.metadata,
          sourceId: this.config.id,
        },
        components: data.components,
        scripts: data.scripts,
        scriptFiles: data.scriptFiles as LuaScriptFile[],
        examples: data.examples,
      }

      this.packageCache.set(cacheKey, packageData)
      return packageData
    } catch (error) {
      console.error(`Failed to fetch remote package ${packageId}:`, error)
      return null
    }
  }

  async hasPackage(packageId: string): Promise<boolean> {
    const index = await this.fetchIndex()
    return index.some((entry) => entry.packageId === packageId)
  }

  async getVersions(packageId: string): Promise<string[]> {
    try {
      const response = await this.fetchWithAuth(
        `${this.config.url}/packages/${packageId}/versions`
      )
      
      if (!response.ok) {
        return []
      }

      const data: RemoteVersionsResponse = await response.json()
      return data.versions.map((v) => v.version)
    } catch (error) {
      console.error(`Failed to fetch versions for ${packageId}:`, error)
      return []
    }
  }

  /**
   * Search packages by query
   */
  async searchPackages(query: string, options?: {
    category?: string
    minLevel?: number
    page?: number
    pageSize?: number
  }): Promise<PackageIndexEntry[]> {
    try {
      const params = new URLSearchParams({ q: query })
      if (options?.category) params.set('category', options.category)
      if (options?.minLevel) params.set('minLevel', String(options.minLevel))
      if (options?.page) params.set('page', String(options.page))
      if (options?.pageSize) params.set('pageSize', String(options.pageSize))

      const response = await this.fetchWithAuth(
        `${this.config.url}/packages/search?${params}`
      )
      
      if (!response.ok) {
        return []
      }

      const data: RemotePackageIndexResponse = await response.json()
      return data.packages.map((pkg) => ({
        ...pkg,
        sourceId: this.config.id,
      }))
    } catch (error) {
      console.error('Failed to search packages:', error)
      return []
    }
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    this.indexCache = null
    this.packageCache.clear()
    this.lastFetch = 0
  }

  /**
   * Set cache expiry time in milliseconds
   */
  setCacheExpiry(ms: number): void {
    this.cacheExpiry = ms
  }

  private async fetchWithAuth(url: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers)
    
    if (this.config.authToken) {
      headers.set('Authorization', `Bearer ${this.config.authToken}`)
    }
    
    headers.set('Accept', 'application/json')
    
    return fetch(url, {
      ...init,
      headers,
    })
  }
}

/**
 * Create a remote package source with configuration
 */
export const createRemoteSource = (
  configOverrides?: Partial<PackageSourceConfig>
): RemotePackageSource => new RemotePackageSource(configOverrides)

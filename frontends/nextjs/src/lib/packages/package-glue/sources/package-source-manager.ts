import { LocalPackageSource } from './local-package-source'
import type {
  PackageData,
  PackageIndexEntry,
  PackageSource,
  PackageSourceConfig,
} from './package-source-types'
import { RemotePackageSource } from './remote-package-source'

/**
 * Conflict resolution strategy when same package exists in multiple sources
 */
export type ConflictResolution = 'priority' | 'latest-version' | 'local-first' | 'remote-first'

/**
 * Package source manager configuration
 */
export interface PackageSourceManagerConfig {
  /** How to resolve conflicts when same package exists in multiple sources */
  conflictResolution: ConflictResolution
  /** Whether to enable parallel fetching from sources */
  parallelFetch: boolean
  /** Maximum number of sources to query in parallel */
  maxParallelSources: number
}

/**
 * Merged package entry with source information
 */
export interface MergedPackageEntry extends PackageIndexEntry {
  /** All sources that have this package */
  availableSources: string[]
  /** The selected source based on conflict resolution */
  selectedSource: string
}

const DEFAULT_CONFIG: PackageSourceManagerConfig = {
  conflictResolution: 'priority',
  parallelFetch: true,
  maxParallelSources: 5,
}

/**
 * Package Source Manager
 * Manages multiple package sources (local and remote) and merges their indexes
 */
export class PackageSourceManager {
  private sources: Map<string, PackageSource> = new Map()
  private config: PackageSourceManagerConfig
  private mergedIndex: Map<string, MergedPackageEntry> | null = null

  constructor(config: Partial<PackageSourceManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Add a package source
   */
  addSource(source: PackageSource): void {
    const sourceConfig = source.getConfig()
    if (!sourceConfig.enabled) {
      return
    }
    this.sources.set(sourceConfig.id, source)
    this.mergedIndex = null // Invalidate cache
  }

  /**
   * Remove a package source
   */
  removeSource(sourceId: string): boolean {
    const removed = this.sources.delete(sourceId)
    if (removed) {
      this.mergedIndex = null
    }
    return removed
  }

  /**
   * Get a specific source by ID
   */
  getSource(sourceId: string): PackageSource | undefined {
    return this.sources.get(sourceId)
  }

  /**
   * Get all registered sources
   */
  getSources(): PackageSource[] {
    return Array.from(this.sources.values())
  }

  /**
   * Get sources sorted by priority
   */
  getSourcesByPriority(): PackageSource[] {
    return this.getSources().sort(
      (a, b) => a.getConfig().priority - b.getConfig().priority
    )
  }

  /**
   * Fetch and merge package indexes from all sources
   */
  async fetchMergedIndex(): Promise<MergedPackageEntry[]> {
    if (this.mergedIndex) {
      return Array.from(this.mergedIndex.values())
    }

    const sortedSources = this.getSourcesByPriority()
    const packageMap = new Map<string, MergedPackageEntry>()

    if (this.config.parallelFetch) {
      // Fetch in parallel
      const results = await Promise.all(
        sortedSources.map(async (source) => ({
          source,
          entries: await source.fetchIndex(),
        }))
      )

      // Process in priority order
      for (const { source, entries } of results) {
        this.mergeEntries(packageMap, entries, source.getConfig())
      }
    } else {
      // Fetch sequentially
      for (const source of sortedSources) {
        const entries = await source.fetchIndex()
        this.mergeEntries(packageMap, entries, source.getConfig())
      }
    }

    this.mergedIndex = packageMap
    return Array.from(packageMap.values())
  }

  /**
   * Load a package from the best available source
   */
  async loadPackage(packageId: string): Promise<PackageData | null> {
    const mergedIndex = await this.fetchMergedIndex()
    const entry = mergedIndex.find((e) => e.packageId === packageId)

    if (!entry) {
      return null
    }

    // Try selected source first
    const selectedSource = this.sources.get(entry.selectedSource)
    if (selectedSource) {
      const pkg = await selectedSource.loadPackage(packageId)
      if (pkg) {
        return pkg
      }
    }

    // Fallback to other sources
    for (const sourceId of entry.availableSources) {
      if (sourceId === entry.selectedSource) continue
      
      const source = this.sources.get(sourceId)
      if (source) {
        const pkg = await source.loadPackage(packageId)
        if (pkg) {
          return pkg
        }
      }
    }

    return null
  }

  /**
   * Load a package from a specific source
   */
  async loadPackageFromSource(
    packageId: string,
    sourceId: string
  ): Promise<PackageData | null> {
    const source = this.sources.get(sourceId)
    if (!source) {
      return null
    }
    return source.loadPackage(packageId)
  }

  /**
   * Check if a package exists in any source
   */
  async hasPackage(packageId: string): Promise<boolean> {
    const mergedIndex = await this.fetchMergedIndex()
    return mergedIndex.some((e) => e.packageId === packageId)
  }

  /**
   * Get all available versions of a package across all sources
   */
  async getAllVersions(packageId: string): Promise<Map<string, string[]>> {
    const versions = new Map<string, string[]>()
    
    await Promise.all(
      this.getSources().map(async (source) => {
        const sourceVersions = await source.getVersions(packageId)
        if (sourceVersions.length > 0) {
          versions.set(source.getConfig().id, sourceVersions)
        }
      })
    )
    
    return versions
  }

  /**
   * Clear all source caches
   */
  clearAllCaches(): void {
    this.mergedIndex = null
    for (const source of this.sources.values()) {
      if ('clearCache' in source && typeof source.clearCache === 'function') {
        source.clearCache()
      }
    }
  }

  private mergeEntries(
    packageMap: Map<string, MergedPackageEntry>,
    entries: PackageIndexEntry[],
    sourceConfig: PackageSourceConfig
  ): void {
    for (const entry of entries) {
      const existing = packageMap.get(entry.packageId)

      if (!existing) {
        // First occurrence
        packageMap.set(entry.packageId, {
          ...entry,
          availableSources: [sourceConfig.id],
          selectedSource: sourceConfig.id,
        })
      } else {
        // Package exists in multiple sources
        existing.availableSources.push(sourceConfig.id)

        // Determine selected source based on resolution strategy
        const shouldReplace = this.shouldReplaceSource(
          existing,
          entry,
          sourceConfig.priority
        )

        if (shouldReplace) {
          packageMap.set(entry.packageId, {
            ...entry,
            availableSources: existing.availableSources,
            selectedSource: sourceConfig.id,
          })
        }
      }
    }
  }

  private shouldReplaceSource(
    existing: MergedPackageEntry,
    newEntry: PackageIndexEntry,
    newPriority: number
  ): boolean {
    const existingSource = this.sources.get(existing.selectedSource)
    const existingPriority = existingSource?.getConfig().priority ?? Infinity

    switch (this.config.conflictResolution) {
      case 'priority':
        return newPriority < existingPriority
      
      case 'latest-version':
        return this.compareVersions(newEntry.version, existing.version) > 0
      
      case 'local-first': {
        const existingType = existingSource?.getConfig().type
        const newType = this.sources.get(newEntry.sourceId)?.getConfig().type
        if (existingType === 'local') return false
        if (newType === 'local') return true
        return newPriority < existingPriority
      }
      
      case 'remote-first': {
        const existingType = existingSource?.getConfig().type
        const newType = this.sources.get(newEntry.sourceId)?.getConfig().type
        if (existingType === 'remote') return false
        if (newType === 'remote') return true
        return newPriority < existingPriority
      }
      
      default:
        return false
    }
  }

  private compareVersions(a: string, b: string): number {
    const partsA = a.split('.').map(Number)
    const partsB = b.split('.').map(Number)
    
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const partA = partsA[i] || 0
      const partB = partsB[i] || 0
      if (partA > partB) return 1
      if (partA < partB) return -1
    }
    
    return 0
  }
}

/**
 * Create a package source manager with default local and optional remote sources
 */
export const createPackageSourceManager = (
  options?: {
    enableRemote?: boolean
    remoteUrl?: string
    remoteAuthToken?: string
    conflictResolution?: ConflictResolution
  }
): PackageSourceManager => {
  const manager = new PackageSourceManager({
    conflictResolution: options?.conflictResolution || 'priority',
  })

  // Always add local source
  manager.addSource(new LocalPackageSource())

  // Optionally add remote source
  if (options?.enableRemote) {
    manager.addSource(
      new RemotePackageSource({
        enabled: true,
        url: options.remoteUrl,
        authToken: options.remoteAuthToken,
      })
    )
  }

  return manager
}

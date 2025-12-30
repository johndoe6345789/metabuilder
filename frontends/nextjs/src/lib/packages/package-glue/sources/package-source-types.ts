import type { PackageComponent, PackageExamples, LuaScriptFile } from '../types'

/**
 * Package source types
 */
export type PackageSourceType = 'local' | 'remote' | 'git'

/**
 * Package source configuration
 */
export interface PackageSourceConfig {
  /** Unique identifier for this source */
  id: string
  /** Display name */
  name: string
  /** Source type */
  type: PackageSourceType
  /** Base URL or path */
  url: string
  /** Priority (lower = higher priority, used for conflict resolution) */
  priority: number
  /** Whether this source is enabled */
  enabled: boolean
  /** Authentication token for remote sources */
  authToken?: string
  /** Branch for git sources */
  branch?: string
}

/**
 * Package index entry from a source
 */
export interface PackageIndexEntry {
  packageId: string
  name: string
  version: string
  description: string
  author: string
  category: string
  dependencies: string[]
  minLevel: number
  icon?: string
  /** Which source this package comes from */
  sourceId: string
  /** Checksum for integrity verification */
  checksum?: string
}

/**
 * Full package data loaded from a source
 */
export interface PackageData {
  metadata: PackageIndexEntry
  components: PackageComponent[]
  scripts?: string
  scriptFiles: LuaScriptFile[]
  examples?: PackageExamples
}

/**
 * Package source interface - implemented by local and remote loaders
 */
export interface PackageSource {
  /** Get the source configuration */
  getConfig(): PackageSourceConfig
  
  /** Fetch the package index from this source */
  fetchIndex(): Promise<PackageIndexEntry[]>
  
  /** Load full package data for a specific package */
  loadPackage(packageId: string): Promise<PackageData | null>
  
  /** Check if a package exists in this source */
  hasPackage(packageId: string): Promise<boolean>
  
  /** Get package versions available */
  getVersions(packageId: string): Promise<string[]>
}

/**
 * Default local source configuration
 */
export const DEFAULT_LOCAL_SOURCE: PackageSourceConfig = {
  id: 'local',
  name: 'Local Packages',
  type: 'local',
  url: '/packages',
  priority: 0,
  enabled: true,
}

/**
 * Default remote source configuration (MetaBuilder registry)
 */
export const DEFAULT_REMOTE_SOURCE: PackageSourceConfig = {
  id: 'metabuilder-registry',
  name: 'MetaBuilder Registry',
  type: 'remote',
  url: 'https://registry.metabuilder.dev/api/v1',
  priority: 10,
  enabled: false, // Disabled by default until registry is available
}

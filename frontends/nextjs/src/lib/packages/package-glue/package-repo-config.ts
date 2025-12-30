import type { PackageSourceConfig, ConflictResolution } from './sources'

/**
 * Package repository configuration
 * This file defines all package sources and how they should be used
 */
export interface PackageRepoConfig {
  /** Conflict resolution strategy */
  conflictResolution: ConflictResolution
  /** List of package sources */
  sources: PackageSourceConfig[]
}

/**
 * Default configuration - local only
 */
export const DEFAULT_PACKAGE_REPO_CONFIG: PackageRepoConfig = {
  conflictResolution: 'priority',
  sources: [
    {
      id: 'local',
      name: 'Local Packages',
      type: 'local',
      url: '/packages',
      priority: 0,
      enabled: true,
    },
  ],
}

/**
 * Development configuration - local with staging remote
 */
export const DEVELOPMENT_PACKAGE_REPO_CONFIG: PackageRepoConfig = {
  conflictResolution: 'local-first',
  sources: [
    {
      id: 'local',
      name: 'Local Development',
      type: 'local',
      url: '/packages',
      priority: 0,
      enabled: true,
    },
    {
      id: 'staging',
      name: 'Staging Registry',
      type: 'remote',
      url: 'https://staging.registry.metabuilder.dev/api/v1',
      priority: 10,
      enabled: false, // Enable when staging registry is available
    },
  ],
}

/**
 * Production configuration - remote first with local fallback
 */
export const PRODUCTION_PACKAGE_REPO_CONFIG: PackageRepoConfig = {
  conflictResolution: 'latest-version',
  sources: [
    {
      id: 'local',
      name: 'Bundled Packages',
      type: 'local',
      url: '/packages',
      priority: 10,
      enabled: true,
    },
    {
      id: 'production',
      name: 'MetaBuilder Registry',
      type: 'remote',
      url: 'https://registry.metabuilder.dev/api/v1',
      priority: 0,
      enabled: false, // Enable when production registry is available
    },
  ],
}

/**
 * Get package repo config based on environment
 */
export const getPackageRepoConfig = (): PackageRepoConfig => {
  const env = process.env.NODE_ENV || 'development'
  const enableRemote = process.env.NEXT_PUBLIC_ENABLE_REMOTE_PACKAGES === 'true'

  let config: PackageRepoConfig

  switch (env) {
    case 'production':
      config = { ...PRODUCTION_PACKAGE_REPO_CONFIG }
      break
    case 'development':
      config = { ...DEVELOPMENT_PACKAGE_REPO_CONFIG }
      break
    default:
      config = { ...DEFAULT_PACKAGE_REPO_CONFIG }
  }

  // Override remote source enabled state from env
  if (enableRemote) {
    config.sources = config.sources.map((source) => ({
      ...source,
      enabled: source.type === 'remote' ? true : source.enabled,
    }))
  }

  // Add auth token from env
  const authToken = process.env.PACKAGE_REGISTRY_AUTH_TOKEN
  if (authToken) {
    config.sources = config.sources.map((source) => ({
      ...source,
      authToken: source.type === 'remote' ? authToken : undefined,
    }))
  }

  return config
}

/**
 * Validate a package repo configuration
 */
export const validatePackageRepoConfig = (config: PackageRepoConfig): string[] => {
  const errors: string[] = []

  if (!config.sources || config.sources.length === 0) {
    errors.push('At least one package source is required')
  }

  const ids = new Set<string>()
  for (const source of config.sources) {
    if (!source.id) {
      errors.push('Source ID is required')
    }
    if (ids.has(source.id)) {
      errors.push(`Duplicate source ID: ${source.id}`)
    }
    ids.add(source.id)

    if (!source.url) {
      errors.push(`Source ${source.id}: URL is required`)
    }

    if (source.type === 'remote' && !source.url.startsWith('http')) {
      errors.push(`Source ${source.id}: Remote URL must start with http(s)`)
    }
  }

  const enabledSources = config.sources.filter((s) => s.enabled)
  if (enabledSources.length === 0) {
    errors.push('At least one source must be enabled')
  }

  return errors
}

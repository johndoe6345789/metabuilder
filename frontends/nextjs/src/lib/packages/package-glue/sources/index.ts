// Package source types and interfaces
export type {
  PackageSourceType,
  PackageSourceConfig,
  PackageIndexEntry,
  PackageData,
  PackageSource,
} from './package-source-types'

export {
  DEFAULT_LOCAL_SOURCE,
  DEFAULT_REMOTE_SOURCE,
} from './package-source-types'

// Local package source
export { LocalPackageSource, createLocalSource } from './local-package-source'

// Remote package source
export { RemotePackageSource, createRemoteSource } from './remote-package-source'

// Package source manager
export type {
  ConflictResolution,
  PackageSourceManagerConfig,
  MergedPackageEntry,
} from './package-source-manager'

export {
  PackageSourceManager,
  createPackageSourceManager,
} from './package-source-manager'

// Package source types and interfaces
export type {
  PackageData,
  PackageIndexEntry,
  PackageSource,
  PackageSourceConfig,
  PackageSourceType,
} from './package-source-types'
export {
  DEFAULT_LOCAL_SOURCE,
  DEFAULT_REMOTE_SOURCE,
} from './package-source-types'

// Local package source
export { createLocalSource,LocalPackageSource } from './local-package-source'

// Remote package source
export { createRemoteSource,RemotePackageSource } from './remote-package-source'

// Package source manager
export type {
  ConflictResolution,
  MergedPackageEntry,
  PackageSourceManagerConfig,
} from './package-source-manager'
export {
  createPackageSourceManager,
  PackageSourceManager,
} from './package-source-manager'

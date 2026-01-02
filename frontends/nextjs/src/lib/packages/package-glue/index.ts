/**
 * Package Glue - Unified package management utilities
 */

// Types
export type {
  LuaScriptFile,
  PackageComponent,
  PackageDefinition,
  PackageExamples,
  PackageRegistry,
} from './types'

// Config
export type { ConflictResolution, PackageRepoConfig, PackageSourceConfig } from './config'
export {
  DEFAULT_PACKAGE_REPO_CONFIG,
  DEVELOPMENT_PACKAGE_REPO_CONFIG,
  PRODUCTION_PACKAGE_REPO_CONFIG,
  getPackageRepoConfig,
  validatePackageRepoConfig,
} from './config'

// Functions
export type { DependencyCheckResult } from './functions'
export {
  checkDependencies,
  getPackage,
  getPackageComponents,
  getPackageScripts,
  getPackagesByCategory,
} from './functions'

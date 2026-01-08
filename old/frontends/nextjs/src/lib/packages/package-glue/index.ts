/**
 * Package Glue - Unified package management utilities
 */

// Types
export type {
  ScriptFile,
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
export type { DependencyCheckResult } from './functions/check-dependencies'
export {
  checkDependencies,
  getPackage,
  getPackageComponents,
  getPackageScripts,
  getPackagesByCategory,
} from './functions/index'

import {
  checkDependencies as checkDepsImpl,
  getPackage as getPackageImpl,
  getPackageComponents as getPackageComponentsImpl,
  getPackageScripts as getPackageScriptsImpl,
  getPackagesByCategory as getPackagesByCategoryImpl,
} from './functions/index'

// Package glue singleton (stub)
export const packageGlue = {
  getPackage: getPackageImpl,
  getPackageComponents: getPackageComponentsImpl,
  getPackageScripts: getPackageScriptsImpl,
  getPackagesByCategory: getPackagesByCategoryImpl,
  checkDependencies: checkDepsImpl,
}

export function getPackageGlue() {
  return packageGlue
}

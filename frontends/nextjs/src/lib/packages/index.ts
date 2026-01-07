/**
 * Package System - Main entry point
 *
 * This module provides unified access to package loading and management.
 * Use the unified/ module for loading packages from any source.
 * Use package-glue/ for registry utilities and configuration.
 */

// Unified package loader (primary API)
export type { UnifiedPackage } from './unified'
export {
  getPackageMetadata,
  getPackagesDir,
  listPackageIds,
  loadAllPackages,
  loadPackage,
  packageExists,
} from './unified'

// Package registry utilities
export type {
  DependencyCheckResult,
  ScriptFile,
  PackageComponent,
  PackageDefinition,
  PackageExamples,
  PackageRegistry,
  PackageRepoConfig,
} from './package-glue'
export {
  checkDependencies,
  getPackage,
  getPackageComponents,
  getPackageRepoConfig,
  getPackageScripts,
  getPackagesByCategory,
  validatePackageRepoConfig,
} from './package-glue'

// JSON package types
export type { JSONComponent, JSONPackage, JSONPackageMetadata, JSONPermission } from './json'

// Core catalog (legacy)
export { PACKAGE_CATALOG } from './core'

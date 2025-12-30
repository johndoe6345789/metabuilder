import { buildPackageRegistry } from './scripts/build-package-registry'
import { checkDependencies } from './scripts/check-dependencies'
import { exportAllPackagesForSeed } from './scripts/export-all-packages-for-seed'
import {
  canAccessPackage,
  getAccessiblePackages,
  getPackagesByLevel,
} from './scripts/get-accessible-packages'
import { getAllPackageScripts } from './scripts/get-all-package-scripts'
import { getInstalledPackages } from './scripts/get-installed-packages'
import { getPackage } from './scripts/get-package'
import { getPackageComponents } from './scripts/get-package-components'
import { getPackageExamples } from './scripts/get-package-examples'
import { getPackageScriptFiles } from './scripts/get-package-script-files'
import { getPackageScripts } from './scripts/get-package-scripts'
import { getPackagesByCategory } from './scripts/get-packages-by-category'
import { installPackage } from './scripts/install-package'
import { installPackageComponents } from './scripts/install-package-components'
import { installPackageScripts } from './scripts/install-package-scripts'
import { isPackageInstalled } from './scripts/is-package-installed'
import { loadPackageIndex } from './scripts/load-package-index'
import {
  getAllDependencies,
  getDependents,
  resolveDependencyOrder,
} from './scripts/resolve-dependencies'
import { uninstallPackage } from './scripts/uninstall-package'

export type { DependencyResolutionResult } from './scripts/resolve-dependencies'
export type { LuaScriptFile, PackageDefinition, PackageRegistry } from './types'

export {
  buildPackageRegistry,
  canAccessPackage,
  checkDependencies,
  exportAllPackagesForSeed,
  getAccessiblePackages,
  getAllDependencies,
  getAllPackageScripts,
  getDependents,
  getInstalledPackages,
  getPackage,
  getPackageComponents,
  getPackageExamples,
  getPackagesByCategory,
  getPackagesByLevel,
  getPackageScriptFiles,
  getPackageScripts,
  installPackage,
  installPackageComponents,
  installPackageScripts,
  isPackageInstalled,
  loadPackageIndex,
  resolveDependencyOrder,
  uninstallPackage,
}
export { getPackageGlue } from './get-package-glue'
export { PackageGlue, packageGlue } from './package-glue'

// Package sources - multi-source repository support
export type { PackageRepoConfig } from './package-repo-config'
export {
  DEFAULT_PACKAGE_REPO_CONFIG,
  DEVELOPMENT_PACKAGE_REPO_CONFIG,
  getPackageRepoConfig,
  PRODUCTION_PACKAGE_REPO_CONFIG,
  validatePackageRepoConfig,
} from './package-repo-config'
export * from './sources'

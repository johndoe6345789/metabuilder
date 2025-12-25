/**
 * Package Loader Module
 * 
 * Handles the initialization and loading of the modular package system.
 * Discovers packages from the /packages directory, builds a registry,
 * and exports seed data for components, scripts, and metadata.
 * 
 * Supports both modular packages (new) and legacy packages from catalog.
 */

import { PACKAGE_CATALOG } from './package-catalog'
import { loadPackageComponents } from './declarative-component-renderer'
import { buildPackageRegistry, exportAllPackagesForSeed, type PackageRegistry } from './package-glue'

// Track initialization state to prevent duplicate loading
let isInitialized = false
// Cache the package registry after first load
let packageRegistry: PackageRegistry | null = null
type ModularPackageSeedData = {
  components: any[]
  scripts: any[]
  packages: any[]
}

const emptyModularPackageSeedData: ModularPackageSeedData = {
  components: [],
  scripts: [],
  packages: []
}

let modularPackageSeedData: ModularPackageSeedData | null = null

/**
 * Initializes the package system by loading all available packages
 * This function is idempotent - calling multiple times is safe
 * 
 * Steps:
 * 1. Check if already initialized (return early if so)
 * 2. Build package registry from /packages directory
 * 3. Extract and export seed data
 * 4. Load package components into renderer
 * 5. Load legacy packages from catalog
 * 
 * @async
 * @returns {Promise<void>}
 */
export async function initializePackageSystem() {
  if (isInitialized) return

  // Load modular packages from /packages folder structure
  try {
    // Build registry with all packages found in /packages
    packageRegistry = await buildPackageRegistry()
    
    // Extract seed data from modular packages (components, scripts, metadata)
    const seedData = exportAllPackagesForSeed(packageRegistry)
    modularPackageSeedData = seedData
    
    // TODO: Replace with proper persistent storage (currently no-op)
    // Modular package data would be stored in database or KV store
    // await Database.setModularPackageComponents(seedData.components)
    // await Database.setModularPackageScripts(seedData.scripts)
    // await Database.setModularPackageMetadata(seedData.packages)
    console.log('Loaded modular package data:', {
      components: seedData.components?.length || 0,
      scripts: seedData.scripts?.length || 0,
      packages: seedData.packages?.length || 0
    })
    
    console.log(`✅ Loaded ${seedData.packages.length} modular packages:`, 
      seedData.packages.map(p => p.name).join(', '))
  } catch (error) {
    console.warn('⚠️ Could not load modular packages:', error)
  }

  // Load legacy packages from catalog for backward compatibility
  Object.values(PACKAGE_CATALOG).forEach(pkg => {
    if (pkg.content) {
      loadPackageComponents(pkg.content)
    }
  })

  isInitialized = true
}

export function getInstalledPackageIds(): string[] {
  return Object.keys(PACKAGE_CATALOG)
}

export function getPackageContent(packageId: string) {
  const pkg = PACKAGE_CATALOG[packageId]
  return pkg ? pkg.content : null
}

export function getPackageManifest(packageId: string) {
  const pkg = PACKAGE_CATALOG[packageId]
  return pkg ? pkg.manifest : null
}

export function getPackageRegistry(): PackageRegistry | null {
  return packageRegistry
}

export async function getModularPackageComponents() {
  // TODO: Replace with proper database query
  // return await Database.getModularPackageComponents() || []
  await initializePackageSystem()
  return (modularPackageSeedData ?? emptyModularPackageSeedData).components
}

export async function getModularPackageScripts() {
  // TODO: Replace with proper database query
  // return await Database.getModularPackageScripts() || []
  await initializePackageSystem()
  return (modularPackageSeedData ?? emptyModularPackageSeedData).scripts
}

export async function getModularPackageMetadata() {
  // TODO: Replace with proper database query
  // return await Database.getModularPackageMetadata() || []
  await initializePackageSystem()
  return (modularPackageSeedData ?? emptyModularPackageSeedData).packages
}

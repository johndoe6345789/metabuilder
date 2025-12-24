import { PACKAGE_CATALOG } from './package-catalog'
import { loadPackageComponents } from './declarative-component-renderer'
import { buildPackageRegistry, exportAllPackagesForSeed, type PackageRegistry } from './package-glue'

let isInitialized = false
let packageRegistry: PackageRegistry | null = null

export async function initializePackageSystem() {
  if (isInitialized) return

  // Load modular packages from /packages folder structure
  try {
    packageRegistry = await buildPackageRegistry()
    
    // Export seed data from modular packages
    const seedData = exportAllPackagesForSeed(packageRegistry)
    
    // Store modular package data in KV for later use
    await window.spark.kv.set('modular_packages_components', seedData.components)
    await window.spark.kv.set('modular_packages_scripts', seedData.scripts)
    await window.spark.kv.set('modular_packages_metadata', seedData.packages)
    
    console.log(`✅ Loaded ${seedData.packages.length} modular packages:`, 
      seedData.packages.map(p => p.name).join(', '))
  } catch (error) {
    console.warn('⚠️ Could not load modular packages:', error)
  }

  // Load legacy packages from catalog
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
  return await window.spark.kv.get('modular_packages_components') || []
}

export async function getModularPackageScripts() {
  return await window.spark.kv.get('modular_packages_scripts') || []
}

export async function getModularPackageMetadata() {
  return await window.spark.kv.get('modular_packages_metadata') || []
}

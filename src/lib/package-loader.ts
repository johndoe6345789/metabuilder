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
  // TODO: Replace with proper database query
  // return await Database.getModularPackageComponents() || []
  return []
}

export async function getModularPackageScripts() {
  // TODO: Replace with proper database query
  // return await Database.getModularPackageScripts() || []
  return []
}

export async function getModularPackageMetadata() {
  // TODO: Replace with proper database query
  // return await Database.getModularPackageMetadata() || []
  return []
}

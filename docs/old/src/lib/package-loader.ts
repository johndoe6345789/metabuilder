import { PACKAGE_CATALOG } from './package-catalog'
import { loadPackageComponents } from './declarative-component-renderer'

let isInitialized = false

export async function initializePackageSystem() {
  if (isInitialized) return

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

import type { PackageComponent, PackageDefinition } from './types'

// Get package components
export function getPackageComponents(pkg: PackageDefinition): PackageComponent[] {
  return pkg.components || []
}

import type { PackageDefinition } from './types'

// Get package components
export function getPackageComponents(pkg: PackageDefinition): any[] {
  return pkg.components || []
}

import type { PackageComponent, PackageDefinition } from '../types'

export function getPackageComponents(pkg: PackageDefinition): PackageComponent[] {
  return pkg.components ?? []
}

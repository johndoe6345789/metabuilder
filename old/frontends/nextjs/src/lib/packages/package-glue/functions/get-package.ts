import type { PackageDefinition, PackageRegistry } from '../types'

export function getPackage(
  registry: PackageRegistry,
  packageId: string
): PackageDefinition | undefined {
  return registry[packageId]
}

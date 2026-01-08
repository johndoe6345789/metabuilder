import type { PackageRegistry } from '../types'

export interface DependencyCheckResult {
  satisfied: boolean
  missing: string[]
}

export function checkDependencies(
  registry: PackageRegistry,
  packageId: string
): DependencyCheckResult {
  const pkg = registry[packageId]
  if (pkg === undefined) return { satisfied: false, missing: [packageId] }
  const missing = pkg.dependencies.filter((dep) => registry[dep] === undefined)
  return { satisfied: missing.length === 0, missing }
}

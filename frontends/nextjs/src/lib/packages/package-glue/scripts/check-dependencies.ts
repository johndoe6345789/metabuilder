import type { PackageRegistry } from './types'

// Check if package dependencies are met
export function checkDependencies(
  registry: PackageRegistry,
  packageId: string
): {
  satisfied: boolean
  missing: string[]
} {
  const pkg = registry[packageId]
  if (!pkg) {
    return { satisfied: false, missing: [packageId] }
  }

  const missing: string[] = []
  for (const depId of pkg.dependencies) {
    if (!registry[depId]) {
      missing.push(depId)
    }
  }

  return {
    satisfied: missing.length === 0,
    missing,
  }
}

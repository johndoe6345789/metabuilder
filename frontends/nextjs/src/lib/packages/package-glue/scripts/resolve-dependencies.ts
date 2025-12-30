import type { PackageRegistry } from '../types'

/**
 * Result of dependency resolution
 */
export interface DependencyResolutionResult {
  /** Packages in load order (dependencies first) */
  loadOrder: string[]
  /** Packages with missing dependencies */
  unresolvable: Array<{ packageId: string; missing: string[] }>
  /** Circular dependency chains detected */
  circular: string[][]
}

/**
 * Resolve package dependencies using topological sort
 * Returns packages in the order they should be loaded
 */
export function resolveDependencyOrder(registry: PackageRegistry): DependencyResolutionResult {
  const result: DependencyResolutionResult = {
    loadOrder: [],
    unresolvable: [],
    circular: [],
  }

  const visited = new Set<string>()
  const visiting = new Set<string>()
  const resolved = new Set<string>()

  // Check for missing dependencies first
  for (const [packageId, pkg] of Object.entries(registry)) {
    const missing = pkg.dependencies.filter(dep => !registry[dep])
    if (missing.length > 0) {
      result.unresolvable.push({ packageId, missing })
    }
  }

  // Topological sort with cycle detection
  function visit(packageId: string, path: string[] = []): boolean {
    if (resolved.has(packageId)) return true
    if (visiting.has(packageId)) {
      // Circular dependency detected
      const cycleStart = path.indexOf(packageId)
      result.circular.push([...path.slice(cycleStart), packageId])
      return false
    }

    const pkg = registry[packageId]
    if (!pkg) return false

    visiting.add(packageId)
    path.push(packageId)

    // Visit dependencies first
    for (const depId of pkg.dependencies) {
      if (registry[depId] && !visit(depId, [...path])) {
        // Dependency failed to resolve
      }
    }

    visiting.delete(packageId)
    resolved.add(packageId)
    result.loadOrder.push(packageId)
    return true
  }

  // Visit all packages
  for (const packageId of Object.keys(registry)) {
    if (!resolved.has(packageId)) {
      visit(packageId)
    }
  }

  return result
}

/**
 * Get all dependencies for a package (transitive)
 */
export function getAllDependencies(
  registry: PackageRegistry,
  packageId: string,
  visited = new Set<string>()
): string[] {
  if (visited.has(packageId)) return []
  visited.add(packageId)

  const pkg = registry[packageId]
  if (!pkg) return []

  const deps: string[] = []
  for (const depId of pkg.dependencies) {
    if (registry[depId]) {
      deps.push(depId)
      deps.push(...getAllDependencies(registry, depId, visited))
    }
  }

  return [...new Set(deps)]
}

/**
 * Get packages that depend on a given package
 */
export function getDependents(registry: PackageRegistry, packageId: string): string[] {
  const dependents: string[] = []
  
  for (const [id, pkg] of Object.entries(registry)) {
    if (pkg.dependencies.includes(packageId)) {
      dependents.push(id)
    }
  }

  return dependents
}

/**
 * Architecture dependency analysis helpers
 */

import { DependencyMetrics, CircularDependency } from '../types/index.js'
import { readFile, normalizeFilePath } from '../utils/fileSystem.js'
import { logger } from '../utils/logger.js'

function hasCyclicDependency(
  file: string,
  deps: Set<string>,
  allImports: Map<string, Set<string>>,
  visited: Set<string>,
  recursionStack: Set<string>,
): boolean {
  if (visited.has(file)) return false
  if (recursionStack.has(file)) return true

  visited.add(file)
  recursionStack.add(file)

  for (const dep of deps) {
    const depImports = allImports.get(dep)
    if (
      depImports &&
      hasCyclicDependency(dep, depImports, allImports, visited, recursionStack)
    ) {
      return true
    }
  }

  recursionStack.delete(file)
  return false
}

/**
 * Analyze dependencies and detect circular dependencies
 */
export function analyzeDependencies(filePaths: string[]): DependencyMetrics {
  const imports = new Map<string, Set<string>>()
  const externalDependencies = new Map<string, number>()

  for (const filePath of filePaths) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue

    try {
      const content = readFile(filePath)
      const normalizedPath = normalizeFilePath(filePath)
      imports.set(normalizedPath, new Set())

      const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g
      let match

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1]

        if (
          importPath.startsWith('@') ||
          (!importPath.startsWith('.') && !importPath.startsWith('/'))
        ) {
          const pkgName = importPath.split('/')[0]
          externalDependencies.set(
            pkgName,
            (externalDependencies.get(pkgName) || 0) + 1,
          )
        } else {
          imports.get(normalizedPath)!.add(importPath)
        }
      }
    } catch {
      logger.debug(`Failed to analyze dependencies in ${filePath}`)
    }
  }

  const circularDependencies: CircularDependency[] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  for (const [file, deps] of imports.entries()) {
    if (hasCyclicDependency(file, deps, imports, visited, recursionStack)) {
      circularDependencies.push({
        path: [file],
        files: [file],
        severity: 'high',
      })
    }
  }

  return {
    totalModules: filePaths.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
      .length,
    circularDependencies: circularDependencies.slice(0, 5),
    layerViolations: [],
    externalDependencies,
  }
}

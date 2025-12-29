/**
 * Shared helpers for package-glue test suites.
 * Individual suites live under ./package-glue/.
 */

import { vi } from 'vitest'

import type { LuaScriptFile, PackageDefinition, PackageRegistry } from '../package-glue'

export function createMockPackage(
  id: string,
  options: Partial<PackageDefinition> = {}
): PackageDefinition {
  return {
    packageId: id,
    name: options.name ?? `Package ${id}`,
    version: options.version ?? '1.0.0',
    description: options.description ?? `Description for ${id}`,
    author: options.author ?? 'Test Author',
    category: options.category ?? 'ui',
    dependencies: options.dependencies ?? [],
    exports: options.exports ?? { components: [] },
    components: options.components ?? [],
    scripts: options.scripts,
    scriptFiles: options.scriptFiles,
    examples: options.examples,
  }
}

export function createMockRegistry(packages: PackageDefinition[]): PackageRegistry {
  const registry: PackageRegistry = {}
  for (const pkg of packages) {
    registry[pkg.packageId] = pkg
  }
  return registry
}

export type MockDb = ReturnType<typeof createMockDb>

export function createMockDb() {
  const data: Record<string, Record<string, any>> = {}
  return {
    set: vi.fn(async (table: string, key: string, value: any) => {
      if (!data[table]) data[table] = {}
      data[table][key] = value
    }),
    get: vi.fn(async (table: string, key: string) => {
      return data[table]?.[key]
    }),
    getAll: vi.fn(async (table: string) => {
      return data[table] || {}
    }),
    delete: vi.fn(async (table: string, key: string) => {
      if (data[table]) delete data[table][key]
    }),
    _data: data,
  }
}

export const mockScriptFiles: LuaScriptFile[] = [
  { name: 'init', path: 'scripts/init.lua', code: 'return {}' },
  { name: 'utils', path: 'scripts/utils.lua', code: 'return true' },
]

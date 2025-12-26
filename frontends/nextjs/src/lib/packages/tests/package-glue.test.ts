/**
 * Tests for package-glue module - Package registry utilities
 * Following parameterized test pattern per project conventions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { PackageRegistry, PackageDefinition, LuaScriptFile } from './package-glue'
import {
  getPackage,
  getPackagesByCategory,
  getPackageComponents,
  getPackageScripts,
  getPackageScriptFiles,
  getAllPackageScripts,
  getPackageExamples,
  checkDependencies,
  installPackageComponents,
  installPackageScripts,
  installPackage,
  uninstallPackage,
  getInstalledPackages,
  isPackageInstalled,
  exportAllPackagesForSeed,
} from './package-glue'

// Helper to create mock package definitions
function createMockPackage(
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

// Helper to create mock registry
function createMockRegistry(packages: PackageDefinition[]): PackageRegistry {
  const registry: PackageRegistry = {}
  for (const pkg of packages) {
    registry[pkg.packageId] = pkg
  }
  return registry
}

// Helper to create mock database
function createMockDb() {
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

describe('package-glue', () => {
  describe('getPackage', () => {
    it.each([
      {
        name: 'returns package when found',
        registry: createMockRegistry([createMockPackage('test_pkg')]),
        packageId: 'test_pkg',
        expectFound: true,
      },
      {
        name: 'returns undefined when not found',
        registry: createMockRegistry([createMockPackage('other_pkg')]),
        packageId: 'test_pkg',
        expectFound: false,
      },
      {
        name: 'returns undefined from empty registry',
        registry: createMockRegistry([]),
        packageId: 'test_pkg',
        expectFound: false,
      },
    ])('should handle $name', ({ registry, packageId, expectFound }) => {
      const result = getPackage(registry, packageId)

      if (expectFound) {
        expect(result).toBeDefined()
        expect(result?.packageId).toBe(packageId)
      } else {
        expect(result).toBeUndefined()
      }
    })
  })

  describe('getPackagesByCategory', () => {
    const mixedRegistry = createMockRegistry([
      createMockPackage('pkg1', { category: 'ui' }),
      createMockPackage('pkg2', { category: 'ui' }),
      createMockPackage('pkg3', { category: 'data' }),
      createMockPackage('pkg4', { category: 'util' }),
    ])

    it.each([
      {
        name: 'returns packages in category',
        registry: mixedRegistry,
        category: 'ui',
        expectedCount: 2,
      },
      {
        name: 'returns single package in category',
        registry: mixedRegistry,
        category: 'data',
        expectedCount: 1,
      },
      {
        name: 'returns empty array for unknown category',
        registry: mixedRegistry,
        category: 'unknown',
        expectedCount: 0,
      },
      {
        name: 'returns empty array from empty registry',
        registry: createMockRegistry([]),
        category: 'ui',
        expectedCount: 0,
      },
    ])('should handle $name', ({ registry, category, expectedCount }) => {
      const result = getPackagesByCategory(registry, category)

      expect(result).toHaveLength(expectedCount)
      result.forEach((pkg) => {
        expect(pkg.category).toBe(category)
      })
    })
  })

  describe('getPackageComponents', () => {
    it.each([
      {
        name: 'returns components array',
        pkg: createMockPackage('test', {
          components: [{ id: 'c1' }, { id: 'c2' }],
        }),
        expectedLength: 2,
      },
      {
        name: 'returns empty array when no components',
        pkg: createMockPackage('test', { components: [] }),
        expectedLength: 0,
      },
      {
        name: 'returns empty array when components is undefined',
        pkg: { ...createMockPackage('test'), components: undefined as any },
        expectedLength: 0,
      },
    ])('should handle $name', ({ pkg, expectedLength }) => {
      const result = getPackageComponents(pkg)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(expectedLength)
    })
  })

  describe('getPackageScripts', () => {
    it.each([
      {
        name: 'returns scripts string',
        pkg: createMockPackage('test', { scripts: 'return 42' }),
        expected: 'return 42',
      },
      {
        name: 'returns empty string when undefined',
        pkg: createMockPackage('test'),
        expected: '',
      },
      {
        name: 'returns empty string when null',
        pkg: { ...createMockPackage('test'), scripts: null as any },
        expected: '',
      },
    ])('should handle $name', ({ pkg, expected }) => {
      const result = getPackageScripts(pkg)

      expect(result).toBe(expected)
    })
  })

  describe('getPackageScriptFiles', () => {
    const mockScriptFiles: LuaScriptFile[] = [
      { name: 'init', path: 'scripts/init.lua', code: 'return {}' },
      { name: 'utils', path: 'scripts/utils.lua', code: 'return true' },
    ]

    it.each([
      {
        name: 'returns script files array',
        pkg: createMockPackage('test', { scriptFiles: mockScriptFiles }),
        expectedLength: 2,
      },
      {
        name: 'returns empty array when undefined',
        pkg: createMockPackage('test'),
        expectedLength: 0,
      },
      {
        name: 'returns empty array when empty',
        pkg: createMockPackage('test', { scriptFiles: [] }),
        expectedLength: 0,
      },
    ])('should handle $name', ({ pkg, expectedLength }) => {
      const result = getPackageScriptFiles(pkg)

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(expectedLength)
    })
  })

  describe('getAllPackageScripts', () => {
    const mockScriptFiles: LuaScriptFile[] = [
      { name: 'init', path: 'scripts/init.lua', code: 'return {}' },
    ]

    it.each([
      {
        name: 'returns both legacy and files',
        pkg: createMockPackage('test', {
          scripts: 'legacy code',
          scriptFiles: mockScriptFiles,
        }),
        expectedLegacy: 'legacy code',
        expectedFilesLength: 1,
      },
      {
        name: 'handles missing legacy',
        pkg: createMockPackage('test', { scriptFiles: mockScriptFiles }),
        expectedLegacy: '',
        expectedFilesLength: 1,
      },
      {
        name: 'handles missing files',
        pkg: createMockPackage('test', { scripts: 'code' }),
        expectedLegacy: 'code',
        expectedFilesLength: 0,
      },
      {
        name: 'handles both missing',
        pkg: createMockPackage('test'),
        expectedLegacy: '',
        expectedFilesLength: 0,
      },
    ])('should handle $name', ({ pkg, expectedLegacy, expectedFilesLength }) => {
      const result = getAllPackageScripts(pkg)

      expect(result.legacy).toBe(expectedLegacy)
      expect(result.files).toHaveLength(expectedFilesLength)
    })
  })

  describe('getPackageExamples', () => {
    it.each([
      {
        name: 'returns examples object',
        pkg: createMockPackage('test', {
          examples: { demo: 'code' },
        }),
        hasExamples: true,
      },
      {
        name: 'returns empty object when undefined',
        pkg: createMockPackage('test'),
        hasExamples: false,
      },
    ])('should handle $name', ({ pkg, hasExamples }) => {
      const result = getPackageExamples(pkg)

      expect(typeof result).toBe('object')
      if (hasExamples) {
        expect(result.demo).toBe('code')
      } else {
        expect(Object.keys(result)).toHaveLength(0)
      }
    })
  })

  describe('checkDependencies', () => {
    it.each([
      {
        name: 'satisfied when no dependencies',
        registry: createMockRegistry([createMockPackage('test')]),
        packageId: 'test',
        expectedSatisfied: true,
        expectedMissing: [],
      },
      {
        name: 'satisfied when all dependencies present',
        registry: createMockRegistry([
          createMockPackage('test', { dependencies: ['dep1', 'dep2'] }),
          createMockPackage('dep1'),
          createMockPackage('dep2'),
        ]),
        packageId: 'test',
        expectedSatisfied: true,
        expectedMissing: [],
      },
      {
        name: 'not satisfied when dependencies missing',
        registry: createMockRegistry([
          createMockPackage('test', { dependencies: ['dep1', 'dep2'] }),
          createMockPackage('dep1'),
        ]),
        packageId: 'test',
        expectedSatisfied: false,
        expectedMissing: ['dep2'],
      },
      {
        name: 'not satisfied when package not found',
        registry: createMockRegistry([]),
        packageId: 'nonexistent',
        expectedSatisfied: false,
        expectedMissing: ['nonexistent'],
      },
    ])('should handle $name', ({ registry, packageId, expectedSatisfied, expectedMissing }) => {
      const result = checkDependencies(registry, packageId)

      expect(result.satisfied).toBe(expectedSatisfied)
      expect(result.missing).toEqual(expectedMissing)
    })
  })

  describe('installPackageComponents', () => {
    it('should install all components to database', async () => {
      const db = createMockDb()
      const pkg = createMockPackage('test', {
        components: [
          { id: 'comp1', type: 'button' },
          { id: 'comp2', type: 'form' },
        ],
      })

      await installPackageComponents(pkg, db)

      expect(db.set).toHaveBeenCalledTimes(2)
      expect(db.set).toHaveBeenCalledWith('components', 'comp1', { id: 'comp1', type: 'button' })
      expect(db.set).toHaveBeenCalledWith('components', 'comp2', { id: 'comp2', type: 'form' })
    })

    it('should handle empty components array', async () => {
      const db = createMockDb()
      const pkg = createMockPackage('test', { components: [] })

      await installPackageComponents(pkg, db)

      expect(db.set).not.toHaveBeenCalled()
    })
  })

  describe('installPackageScripts', () => {
    it('should install legacy script', async () => {
      const db = createMockDb()
      const pkg = createMockPackage('test', { scripts: 'return 42' })

      await installPackageScripts(pkg, db)

      expect(db.set).toHaveBeenCalledWith('lua_scripts', 'package_test', {
        id: 'package_test',
        name: 'Package test Scripts',
        code: 'return 42',
        category: 'package',
        packageId: 'test',
      })
    })

    it('should install multi-file scripts', async () => {
      const db = createMockDb()
      const pkg = createMockPackage('test', {
        scriptFiles: [
          { name: 'init', path: 'scripts/init.lua', code: 'return {}', category: 'setup', description: 'Init script' },
        ],
      })

      await installPackageScripts(pkg, db)

      expect(db.set).toHaveBeenCalledWith('lua_scripts', 'package_test_init', {
        id: 'package_test_init',
        name: 'Package test - init',
        code: 'return {}',
        category: 'setup',
        packageId: 'test',
        path: 'scripts/init.lua',
        description: 'Init script',
      })
    })

    it('should install both legacy and multi-file scripts', async () => {
      const db = createMockDb()
      const pkg = createMockPackage('test', {
        scripts: 'legacy',
        scriptFiles: [{ name: 'utils', path: 'scripts/utils.lua', code: 'helpers' }],
      })

      await installPackageScripts(pkg, db)

      expect(db.set).toHaveBeenCalledTimes(2)
    })
  })

  describe('installPackage', () => {
    it.each([
      {
        name: 'successfully installs package',
        registry: createMockRegistry([createMockPackage('test')]),
        packageId: 'test',
        expectSuccess: true,
      },
      {
        name: 'fails when package not found',
        registry: createMockRegistry([]),
        packageId: 'nonexistent',
        expectSuccess: false,
        expectedError: 'Package nonexistent not found',
      },
      {
        name: 'fails when dependencies missing',
        registry: createMockRegistry([
          createMockPackage('test', { dependencies: ['missing'] }),
        ]),
        packageId: 'test',
        expectSuccess: false,
        expectedError: 'Missing dependencies: missing',
      },
    ])('should handle $name', async ({ registry, packageId, expectSuccess, expectedError }) => {
      const db = createMockDb()

      const result = await installPackage(registry, packageId, db)

      expect(result.success).toBe(expectSuccess)
      if (expectedError) {
        expect(result.error).toContain(expectedError)
      }
      if (expectSuccess) {
        expect(db.set).toHaveBeenCalledWith(
          'installed_packages',
          packageId,
          expect.objectContaining({ packageId, name: expect.any(String) })
        )
      }
    })
  })

  describe('uninstallPackage', () => {
    it.each([
      {
        name: 'successfully uninstalls package',
        registry: createMockRegistry([
          createMockPackage('test', { components: [{ id: 'c1' }] }),
        ]),
        packageId: 'test',
        expectSuccess: true,
      },
      {
        name: 'fails when package not found',
        registry: createMockRegistry([]),
        packageId: 'nonexistent',
        expectSuccess: false,
        expectedError: 'Package nonexistent not found',
      },
    ])('should handle $name', async ({ registry, packageId, expectSuccess, expectedError }) => {
      const db = createMockDb()

      const result = await uninstallPackage(registry, packageId, db)

      expect(result.success).toBe(expectSuccess)
      if (expectedError) {
        expect(result.error).toContain(expectedError)
      }
      if (expectSuccess) {
        expect(db.delete).toHaveBeenCalledWith('installed_packages', packageId)
      }
    })
  })

  describe('getInstalledPackages', () => {
    it('should return installed package IDs', async () => {
      const db = createMockDb()
      db._data['installed_packages'] = { pkg1: {}, pkg2: {} }

      const result = await getInstalledPackages(db)

      expect(result).toEqual(['pkg1', 'pkg2'])
    })

    it('should return empty array on error', async () => {
      const db = createMockDb()
      db.getAll = vi.fn().mockRejectedValue(new Error('DB error'))

      const result = await getInstalledPackages(db)

      expect(result).toEqual([])
    })

    it('should return empty array when no packages', async () => {
      const db = createMockDb()

      const result = await getInstalledPackages(db)

      expect(result).toEqual([])
    })
  })

  describe('isPackageInstalled', () => {
    it.each([
      {
        name: 'returns true when installed',
        setupDb: (db: ReturnType<typeof createMockDb>) => {
          db._data['installed_packages'] = { test: { packageId: 'test' } }
        },
        packageId: 'test',
        expected: true,
      },
      {
        name: 'returns false when not installed',
        setupDb: () => {},
        packageId: 'test',
        expected: false,
      },
    ])('should handle $name', async ({ setupDb, packageId, expected }) => {
      const db = createMockDb()
      setupDb(db)

      const result = await isPackageInstalled(packageId, db)

      expect(result).toBe(expected)
    })

    it('should return false on error', async () => {
      const db = createMockDb()
      db.get = vi.fn().mockRejectedValue(new Error('DB error'))

      const result = await isPackageInstalled('test', db)

      expect(result).toBe(false)
    })
  })

  describe('exportAllPackagesForSeed', () => {
    it('should export all package data', () => {
      const registry = createMockRegistry([
        createMockPackage('pkg1', {
          name: 'Package 1',
          components: [{ id: 'c1' }],
          scripts: 'lua code',
        }),
        createMockPackage('pkg2', {
          name: 'Package 2',
          scriptFiles: [{ name: 'init', path: 'scripts/init.lua', code: 'return {}' }],
        }),
      ])

      const result = exportAllPackagesForSeed(registry)

      expect(result.components).toHaveLength(1)
      expect(result.scripts).toHaveLength(2) // 1 legacy + 1 file
      expect(result.packages).toHaveLength(2)
      expect(result.packages[0].packageId).toBe('pkg1')
      expect(result.packages[1].packageId).toBe('pkg2')
    })

    it('should handle empty registry', () => {
      const result = exportAllPackagesForSeed({})

      expect(result.components).toEqual([])
      expect(result.scripts).toEqual([])
      expect(result.packages).toEqual([])
    })

    it('should include script metadata', () => {
      const registry = createMockRegistry([
        createMockPackage('pkg', {
          scriptFiles: [
            {
              name: 'utils',
              path: 'scripts/utils.lua',
              code: 'return true',
              category: 'helpers',
              description: 'Utility functions',
            },
          ],
        }),
      ])

      const result = exportAllPackagesForSeed(registry)

      expect(result.scripts[0]).toMatchObject({
        id: 'package_pkg_utils',
        name: 'Package pkg - utils',
        code: 'return true',
        category: 'helpers',
        path: 'scripts/utils.lua',
        description: 'Utility functions',
      })
    })
  })
})

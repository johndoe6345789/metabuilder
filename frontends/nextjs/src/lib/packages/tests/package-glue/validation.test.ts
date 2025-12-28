import { describe, it, expect } from 'vitest'

import type { LuaScriptFile } from '../../package-glue'
import {
  checkDependencies,
  getAllPackageScripts,
  getPackage,
  getPackageComponents,
  getPackageExamples,
  getPackageScriptFiles,
  getPackageScripts,
  getPackagesByCategory,
} from '../../package-glue'
import { createMockPackage, createMockRegistry } from '../package-glue.test'

describe('package-glue validation', () => {
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
})

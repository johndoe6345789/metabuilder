import { describe, it, expect, vi } from 'vitest'

import {
  getInstalledPackages,
  installPackage,
  installPackageComponents,
  installPackageScripts,
  isPackageInstalled,
  uninstallPackage,
} from '../../package-glue'
import { createMockDb, createMockPackage, createMockRegistry, mockScriptFiles } from '../package-glue.test'

describe('package-glue execution', () => {
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
      const scriptFiles = mockScriptFiles.slice(0, 1)
      const pkg = createMockPackage('test', {
        scripts: 'legacy',
        scriptFiles,
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
})

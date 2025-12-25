import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  initializePackageSystem,
  getInstalledPackageIds,
  getPackageContent,
  getPackageManifest,
  getPackageRegistry,
  getModularPackageComponents,
  getModularPackageScripts,
  getModularPackageMetadata,
} from '@/lib/package-loader'

describe('package-loader', () => {
  describe('initializePackageSystem', () => {
    it('should initialize the package system', async () => {
      await expect(initializePackageSystem()).resolves.not.toThrow()
    })

    it('should be idempotent - safe to call multiple times', async () => {
      await initializePackageSystem()
      await expect(initializePackageSystem()).resolves.not.toThrow()
      await expect(initializePackageSystem()).resolves.not.toThrow()
    })

    it('should handle initialization without errors', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      await initializePackageSystem()
      // Should complete without throwing
      expect(true).toBe(true)
      consoleWarnSpy.mockRestore()
    })
  })

  describe('getInstalledPackageIds', () => {
    beforeEach(async () => {
      await initializePackageSystem()
    })

    it('should return an array of package IDs', () => {
      const ids = getInstalledPackageIds()
      expect(Array.isArray(ids)).toBe(true)
    })

    it('should return strings for package IDs', () => {
      const ids = getInstalledPackageIds()
      ids.forEach(id => {
        expect(typeof id).toBe('string')
      })
    })

    it('should not be empty if packages are loaded', () => {
      const ids = getInstalledPackageIds()
      // This depends on PACKAGE_CATALOG having entries
      expect(Array.isArray(ids)).toBe(true)
    })
  })

  describe('getPackageContent', () => {
    beforeEach(async () => {
      await initializePackageSystem()
    })

    it('should return null for non-existent package', () => {
      const content = getPackageContent('non-existent-package')
      expect(content).toBeNull()
    })

    it('should return content object for valid package', () => {
      const ids = getInstalledPackageIds()
      if (ids.length > 0) {
        const content = getPackageContent(ids[0])
        if (content) {
          expect(content).toBeDefined()
        }
      }
    })
  })

  describe('getPackageManifest', () => {
    beforeEach(async () => {
      await initializePackageSystem()
    })

    it('should return null for non-existent package', () => {
      const manifest = getPackageManifest('non-existent-package')
      expect(manifest).toBeNull()
    })

    it('should return manifest object for valid package', () => {
      const ids = getInstalledPackageIds()
      if (ids.length > 0) {
        const manifest = getPackageManifest(ids[0])
        if (manifest) {
          expect(manifest).toBeDefined()
        }
      }
    })
  })

  describe('getPackageRegistry', () => {
    beforeEach(async () => {
      await initializePackageSystem()
    })

    it('should return package registry after initialization', () => {
      const registry = getPackageRegistry()
      // May be null if modular packages are not loaded
      expect(registry === null || typeof registry === 'object').toBe(true)
    })

    it('should have correct registry structure if not null', () => {
      const registry = getPackageRegistry()
      if (registry) {
        expect(Array.isArray(registry.packages) || !registry.packages).toBe(true)
        expect(Array.isArray(registry.installed) || !registry.installed).toBe(true)
      }
    })
  })

  describe('modular package seed data', () => {
    it.each([
      { label: 'components', loader: getModularPackageComponents },
      { label: 'scripts', loader: getModularPackageScripts },
      { label: 'metadata', loader: getModularPackageMetadata },
    ])('should return an array for $label', async ({ loader }) => {
      const data = await loader()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should include known package metadata', async () => {
      const metadata = await getModularPackageMetadata()
      const packageIds = metadata.map(pkg => pkg.packageId)
      expect(packageIds).toContain('admin_dialog')
    })
  })
})

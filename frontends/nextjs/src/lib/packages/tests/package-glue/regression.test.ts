import { describe, it, expect } from 'vitest'

import { exportAllPackagesForSeed } from '../../package-glue'
import { createMockPackage, createMockRegistry } from '../package-glue.test'

describe('package-glue regressions', () => {
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
      expect(result.scripts).toHaveLength(2)
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

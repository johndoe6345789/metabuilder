import { describe, expect, it } from 'vitest'

import adminDialogMetadata from '../../../../packages/admin_dialog/seed/metadata.json'
import dashboardMetadata from '../../../../packages/dashboard/seed/metadata.json'
import dataTableMetadata from '../../../../packages/data_table/seed/metadata.json'
import formBuilderMetadata from '../../../../packages/form_builder/seed/metadata.json'
import navMenuMetadata from '../../../../packages/nav_menu/seed/metadata.json'
import notificationCenterMetadata from '../../../../packages/notification_center/seed/metadata.json'
import uiDialogsMetadata from '../../../../packages/ui_dialogs/seed/metadata.json'
import uiPermissionsMetadata from '../../../../packages/ui_permissions/seed/metadata.json'

const packages = [
  adminDialogMetadata,
  dashboardMetadata,
  dataTableMetadata,
  formBuilderMetadata,
  navMenuMetadata,
  notificationCenterMetadata,
  uiDialogsMetadata,
  uiPermissionsMetadata,
]

describe('Package System Integration', () => {
  it('should have all packages with unique IDs', () => {
    const packageIds = packages.map(pkg => pkg.packageId)
    const uniqueIds = new Set(packageIds)
    expect(uniqueIds.size).toBe(packageIds.length)
  })

  it('should have all packages with valid versions', () => {
    packages.forEach(pkg => {
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  it('should have all packages with metadata', () => {
    packages.forEach(pkg => {
      expect(pkg.packageId).toBeDefined()
      expect(pkg.name).toBeDefined()
      expect(pkg.description).toBeDefined()
      expect(pkg.author).toBeDefined()
    })
  })

  it('should have all packages with valid categories', () => {
    const validCategories = ['ui', 'data', 'utility', 'system', 'integration']
    packages.forEach(pkg => {
      expect(validCategories).toContain(pkg.category)
    })
  })

  it('should have all packages with exports configuration', () => {
    packages.forEach(pkg => {
      expect(pkg.exports).toBeDefined()
      expect(pkg.exports.components).toBeInstanceOf(Array)
    })
  })

  it('should have all packages with dependencies array', () => {
    packages.forEach(pkg => {
      expect(pkg.dependencies).toBeInstanceOf(Array)
    })
  })

  it('should not have circular dependencies', () => {
    const getDependencies = (pkgId: string, visited = new Set<string>()): Set<string> => {
      if (visited.has(pkgId)) {
        throw new Error(`Circular dependency detected: ${pkgId}`)
      }
      visited.add(pkgId)

      const pkg = packages.find(p => p.packageId === pkgId)
      if (pkg === undefined) return visited

      pkg.dependencies.forEach((depId: string) => {
        getDependencies(depId, new Set(visited))
      })

      return visited
    }

    packages.forEach(pkg => {
      expect(() => getDependencies(pkg.packageId)).not.toThrow()
    })
  })

  it('should have all dependencies reference valid packages', () => {
    const allPackageIds = packages.map(pkg => pkg.packageId)

    packages.forEach(pkg => {
      pkg.dependencies.forEach((depId: string) => {
        expect(allPackageIds).toContain(depId)
      })
    })
  })
})

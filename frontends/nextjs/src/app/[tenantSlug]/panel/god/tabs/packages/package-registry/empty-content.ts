import type { PackageContent } from '@/lib/packages/core/package-types'

export function emptyContent(): PackageContent {
  return {
    schemas: [],
    pages: [],
    workflows: [],
    componentHierarchy: {},
    componentConfigs: {},
    cssClasses: [],
    dropdownConfigs: [],
  }
}

import type { ExportPackageOptions } from '@/lib/packages/core/package-export'
import type { PackageManifest } from '@/lib/package-types'

export const defaultExportOptions: ExportPackageOptions = {
  includeAssets: true,
  includeSchemas: true,
  includePages: true,
  includeWorkflows: true,
  includeLuaScripts: true,
  includeComponentHierarchy: true,
  includeComponentConfigs: true,
  includeCssClasses: true,
  includeDropdownConfigs: true,
  includeSeedData: true,
}

export const defaultManifest: Partial<PackageManifest> = {
  name: '',
  version: '1.0.0',
  description: '',
  author: '',
  category: 'other',
  tags: [],
}

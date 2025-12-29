import type { PackageContent, PackageManifest } from '../package-types'

export interface ExportPackageOptions {
  includeAssets?: boolean
  includeSchemas?: boolean
  includePages?: boolean
  includeWorkflows?: boolean
  includeLuaScripts?: boolean
  includeComponentHierarchy?: boolean
  includeComponentConfigs?: boolean
  includeCssClasses?: boolean
  includeDropdownConfigs?: boolean
  includeSeedData?: boolean
}

export type AssetType = 'image' | 'video' | 'audio' | 'document'

export interface AssetFile {
  path: string
  blob: Blob
  type: AssetType
}

export type { PackageContent, PackageManifest }

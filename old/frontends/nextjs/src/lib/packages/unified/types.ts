import type { JSONPackage } from '../json/types'
import type { PackageCatalogData } from '../core/package-catalog'

export interface UnifiedPackage {
  packageId: string
  name: string
  version: string
  description: string
  category?: string
  minLevel?: number
  source: 'json' | 'legacy'
  jsonData?: JSONPackage
  legacyData?: PackageCatalogData
}

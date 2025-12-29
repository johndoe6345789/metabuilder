import { exportPackageAsZip } from './export-package-as-zip'
import type { ComponentConfig, ComponentNode, CssCategory, DropdownConfig } from '@/lib/db/core/types'
import type { LuaScript, PageConfig, Workflow } from '@/lib/types/level-types'
import type { ModelSchema } from '@/lib/types/schema-types'
import type { AssetFile, PackageContent, PackageManifest } from './types'

export async function exportDatabaseSnapshot(
  schemas: ModelSchema[],
  pages: PageConfig[],
  workflows: Workflow[],
  luaScripts: LuaScript[],
  componentHierarchy: Record<string, ComponentNode>,
  componentConfigs: Record<string, ComponentConfig>,
  cssClasses: CssCategory[],
  dropdownConfigs: DropdownConfig[],
  assets: AssetFile[] = []
): Promise<Blob> {
  const manifest: PackageManifest = {
    id: `snapshot_${Date.now()}`,
    name: 'Database Snapshot',
    version: '1.0.0',
    description: 'Complete database snapshot export',
    author: 'User Export',
    category: 'other',
    icon: '💾',
    screenshots: [],
    tags: ['snapshot', 'backup', 'export'],
    dependencies: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    downloadCount: 0,
    rating: 0,
    installed: false,
  }

  const content: PackageContent = {
    schemas,
    pages,
    workflows,
    luaScripts,
    componentHierarchy,
    componentConfigs,
    cssClasses,
    dropdownConfigs,
  }

  return exportPackageAsZip(manifest, content, assets)
}

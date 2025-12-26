import type { AssetFile, PackageContent, PackageManifest } from './types'
import { exportPackageAsZip } from './export-package-as-zip'

export async function exportDatabaseSnapshot(
  schemas: any[],
  pages: any[],
  workflows: any[],
  luaScripts: any[],
  componentHierarchy: Record<string, any>,
  componentConfigs: Record<string, any>,
  cssClasses: any[],
  dropdownConfigs: any[],
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

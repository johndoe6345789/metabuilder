import { Database } from '@/lib/database'
import type { PackageContent, PackageManifest } from '@/lib/package-types'
import type { ExportPackageOptions } from '@/lib/packages/core/package-export'
import { downloadZip, exportPackageAsZip } from '@/lib/packages/core/package-export'

const buildManifest = (manifest: Partial<PackageManifest>): PackageManifest => ({
  id: `pkg_${Date.now()}`,
  name: manifest.name!,
  version: manifest.version || '1.0.0',
  description: manifest.description || '',
  author: manifest.author || 'Anonymous',
  category: (manifest.category as any) || 'other',
  icon: '📦',
  screenshots: [],
  tags: manifest.tags || [],
  dependencies: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  downloadCount: 0,
  rating: 0,
  installed: false,
})

const buildContent = async (exportOptions: ExportPackageOptions): Promise<PackageContent> => {
  const [
    schemas,
    pages,
    workflows,
    luaScripts,
    componentHierarchy,
    componentConfigs,
    cssClasses,
    dropdownConfigs,
  ] = await Promise.all([
    Database.getSchemas(),
    Database.getPages(),
    Database.getWorkflows(),
    Database.getLuaScripts(),
    Database.getComponentHierarchy(),
    Database.getComponentConfigs(),
    Database.getCssClasses(),
    Database.getDropdownConfigs(),
  ])

  return {
    schemas: exportOptions.includeSchemas ? schemas : [],
    pages: exportOptions.includePages ? pages : [],
    workflows: exportOptions.includeWorkflows ? workflows : [],
    luaScripts: exportOptions.includeLuaScripts ? luaScripts : [],
    componentHierarchy: exportOptions.includeComponentHierarchy ? componentHierarchy : {},
    componentConfigs: exportOptions.includeComponentConfigs ? componentConfigs : {},
    cssClasses: exportOptions.includeCssClasses ? cssClasses : undefined,
    dropdownConfigs: exportOptions.includeDropdownConfigs ? dropdownConfigs : undefined,
  }
}

export const generatePackageExport = async (
  manifest: Partial<PackageManifest>,
  exportOptions: ExportPackageOptions
) => {
  const fullManifest = buildManifest(manifest)
  const content = await buildContent(exportOptions)
  const blob = await exportPackageAsZip(fullManifest, content, [], exportOptions)
  const version = manifest.version || '1.0.0'
  const sanitizedName = manifest.name?.toLowerCase().replace(/\s+/g, '-') || 'package'
  const fileName = `${sanitizedName}-${version}.zip`

  downloadZip(blob, fileName)

  return { fileName }
}

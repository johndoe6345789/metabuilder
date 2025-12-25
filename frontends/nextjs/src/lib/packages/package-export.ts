import JSZip from 'jszip'
import type { PackageManifest, PackageContent } from './package-types'
import type { DatabaseSchema } from './database'

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

export interface AssetFile {
  path: string
  blob: Blob
  type: 'image' | 'video' | 'audio' | 'document'
}

export async function exportPackageAsZip(
  manifest: PackageManifest,
  content: PackageContent,
  assets: AssetFile[] = [],
  options: ExportPackageOptions = {}
): Promise<Blob> {
  const zip = new JSZip()

  const opts = {
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
    ...options,
  }

  zip.file('manifest.json', JSON.stringify(manifest, null, 2))

  const packageContent: Partial<PackageContent> = {}

  if (opts.includeSchemas && content.schemas) {
    packageContent.schemas = content.schemas
  }

  if (opts.includePages && content.pages) {
    packageContent.pages = content.pages
  }

  if (opts.includeWorkflows && content.workflows) {
    packageContent.workflows = content.workflows
  }

  if (opts.includeLuaScripts && content.luaScripts) {
    packageContent.luaScripts = content.luaScripts
  }

  if (opts.includeComponentHierarchy && content.componentHierarchy) {
    packageContent.componentHierarchy = content.componentHierarchy
  }

  if (opts.includeComponentConfigs && content.componentConfigs) {
    packageContent.componentConfigs = content.componentConfigs
  }

  if (opts.includeCssClasses && content.cssClasses) {
    packageContent.cssClasses = content.cssClasses
  }

  if (opts.includeDropdownConfigs && content.dropdownConfigs) {
    packageContent.dropdownConfigs = content.dropdownConfigs
  }

  if (opts.includeSeedData && content.seedData) {
    packageContent.seedData = content.seedData
  }

  zip.file('content.json', JSON.stringify(packageContent, null, 2))

  if (opts.includeAssets && assets.length > 0) {
    const assetsFolder = zip.folder('assets')
    if (assetsFolder) {
      for (const asset of assets) {
        const typeFolder = assetsFolder.folder(asset.type + 's')
        if (typeFolder) {
          const fileName = asset.path.split('/').pop() || 'unnamed'
          typeFolder.file(fileName, asset.blob)
        }
      }

      const assetManifest = assets.map(asset => ({
        originalPath: asset.path,
        type: asset.type,
        fileName: asset.path.split('/').pop(),
      }))

      assetsFolder.file('asset-manifest.json', JSON.stringify(assetManifest, null, 2))
    }
  }

  zip.file('README.md', generateReadme(manifest, content))

  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}

export async function importPackageFromZip(zipFile: File): Promise<{
  manifest: PackageManifest
  content: PackageContent
  assets: Array<{ path: string; blob: Blob; type: 'image' | 'video' | 'audio' | 'document' }>
}> {
  const zip = await JSZip.loadAsync(zipFile)

  const manifestFile = zip.file('manifest.json')
  if (!manifestFile) {
    throw new Error('Invalid package: manifest.json not found')
  }

  const manifestText = await manifestFile.async('text')
  const manifest: PackageManifest = JSON.parse(manifestText)

  const contentFile = zip.file('content.json')
  if (!contentFile) {
    throw new Error('Invalid package: content.json not found')
  }

  const contentText = await contentFile.async('text')
  const content: PackageContent = JSON.parse(contentText)

  const assets: Array<{ path: string; blob: Blob; type: 'image' | 'video' | 'audio' | 'document' }> = []

  const assetManifestFile = zip.file('assets/asset-manifest.json')
  if (assetManifestFile) {
    const assetManifestText = await assetManifestFile.async('text')
    const assetManifest: Array<{ originalPath: string; type: string; fileName: string }> = JSON.parse(assetManifestText)

    for (const assetInfo of assetManifest) {
      const assetPath = `assets/${assetInfo.type}s/${assetInfo.fileName}`
      const assetFile = zip.file(assetPath)

      if (assetFile) {
        const blob = await assetFile.async('blob')
        assets.push({
          path: assetInfo.originalPath,
          blob,
          type: assetInfo.type as 'image' | 'video' | 'audio' | 'document',
        })
      }
    }
  }

  return { manifest, content, assets }
}

export function downloadZip(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generateReadme(manifest: PackageManifest, content: PackageContent): string {
  return `# ${manifest.name}

Version: ${manifest.version}
Author: ${manifest.author}
Category: ${manifest.category}

## Description

${manifest.description}

## Contents

- **Schemas**: ${content.schemas?.length || 0} data models
- **Pages**: ${content.pages?.length || 0} page configurations
- **Workflows**: ${content.workflows?.length || 0} workflows
- **Lua Scripts**: ${content.luaScripts?.length || 0} scripts
- **Components**: ${Object.keys(content.componentHierarchy || {}).length} component hierarchies
- **CSS Classes**: ${content.cssClasses?.length || 0} CSS categories
- **Dropdown Configs**: ${content.dropdownConfigs?.length || 0} dropdown configurations

## Tags

${manifest.tags.join(', ')}

## Installation

Import this package through the MetaBuilder Package Manager.

## Dependencies

${manifest.dependencies.length > 0 ? manifest.dependencies.join(', ') : 'None'}

---

Generated by MetaBuilder Package Exporter
`
}

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

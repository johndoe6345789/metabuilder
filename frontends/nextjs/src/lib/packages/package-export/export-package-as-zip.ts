import JSZip from 'jszip'
import type { AssetFile, ExportPackageOptions, PackageContent, PackageManifest } from './types'
import { generateReadme } from './generate-readme'

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

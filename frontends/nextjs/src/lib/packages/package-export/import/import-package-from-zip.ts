import JSZip from 'jszip'

import type { AssetType, PackageContent, PackageManifest } from './types'

export async function importPackageFromZip(zipFile: File): Promise<{
  manifest: PackageManifest
  content: PackageContent
  assets: Array<{ path: string; blob: Blob; type: AssetType }>
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

  const assets: Array<{ path: string; blob: Blob; type: AssetType }> = []

  const assetManifestFile = zip.file('assets/asset-manifest.json')
  if (assetManifestFile) {
    const assetManifestText = await assetManifestFile.async('text')
    const assetManifest: Array<{ originalPath: string; type: AssetType; fileName: string }> =
      JSON.parse(assetManifestText)

    for (const assetInfo of assetManifest) {
      const assetPath = `assets/${assetInfo.type}s/${assetInfo.fileName}`
      const assetFile = zip.file(assetPath)

      if (assetFile) {
        const blob = await assetFile.async('blob')
        assets.push({
          path: assetInfo.originalPath,
          blob,
          type: assetInfo.type,
        })
      }
    }
  }

  return { manifest, content, assets }
}

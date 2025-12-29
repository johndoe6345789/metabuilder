import type { PackageTemplateConfig } from './types'

export function buildPackageManifestJson(config: PackageTemplateConfig): string {
  const manifest = {
    scripts: config.luaScripts.map(script => ({
      file: script.fileName,
      name: script.fileName.replace(/\.lua$/, ''),
      category: 'package',
      description: script.description,
    })),
  }
  return JSON.stringify(manifest, null, 2)
}

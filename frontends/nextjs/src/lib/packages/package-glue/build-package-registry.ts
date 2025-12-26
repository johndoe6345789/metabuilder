import { DEFAULT_PACKAGES } from './default-packages'
import { loadLuaScript } from './load-lua-script'
import { loadLuaScriptsFolder } from './load-lua-scripts-folder'
import { loadPackageSeedJson } from './load-package-seed-json'
import type { PackageRegistry } from './types'

// Build package registry
export async function buildPackageRegistry(): Promise<PackageRegistry> {
  const registry: PackageRegistry = {}

  for (const [packageId, config] of Object.entries(DEFAULT_PACKAGES)) {
    const [metadata, components, examples] = await Promise.all([
      loadPackageSeedJson(packageId, 'seed/metadata.json', config.metadata),
      loadPackageSeedJson(packageId, 'seed/components.json', config.components),
      loadPackageSeedJson(packageId, 'static_content/examples.json', config.examples),
    ])
    const scripts = await loadLuaScript(packageId)
    const scriptFiles = await loadLuaScriptsFolder(packageId)

    registry[packageId] = {
      ...metadata,
      components,
      scripts,
      scriptFiles,
      examples,
    }
  }

  return registry
}

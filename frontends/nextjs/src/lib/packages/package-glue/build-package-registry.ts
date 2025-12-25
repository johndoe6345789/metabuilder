import { DEFAULT_PACKAGES } from './default-packages'
import { loadLuaScript } from './load-lua-script'
import { loadLuaScriptsFolder } from './load-lua-scripts-folder'
import type { PackageRegistry } from './types'

// Build package registry
export async function buildPackageRegistry(): Promise<PackageRegistry> {
  const registry: PackageRegistry = {}

  for (const [packageId, config] of Object.entries(DEFAULT_PACKAGES)) {
    const scripts = await loadLuaScript(packageId)
    const scriptFiles = await loadLuaScriptsFolder(packageId)

    registry[packageId] = {
      ...config.metadata,
      components: config.components,
      scripts,
      scriptFiles,
      examples: config.examples,
    }
  }

  return registry
}

import { DEFAULT_PACKAGES, type PackageSeedConfig } from './default-packages'
import { loadLuaScript } from './load-lua-script'
import { loadLuaScriptsFolder } from './load-lua-scripts-folder'
import { loadPackageIndex } from './load-package-index'
import { loadPackageSeedJson } from './load-package-seed-json'
import type { PackageRegistry } from './types'

// Build package registry
export async function buildPackageRegistry(): Promise<PackageRegistry> {
  const registry: PackageRegistry = {}
  const packageIndex = await loadPackageIndex()
  const indexEntries = packageIndex ?? []
  const indexById = new Map(indexEntries.map(entry => [entry.packageId, entry]))
  const packageIds =
    indexEntries.length > 0
      ? indexEntries.map(entry => entry.packageId)
      : Object.keys(DEFAULT_PACKAGES)

  for (const packageId of packageIds) {
    const indexEntry = indexById.get(packageId)
    const fallbackConfig: PackageSeedConfig = DEFAULT_PACKAGES[packageId] ?? {
      metadata: {
        packageId,
        name: indexEntry?.name ?? packageId,
        version: indexEntry?.version ?? '1.0.0',
        description: indexEntry?.description ?? `${packageId} package`,
        author: indexEntry?.author ?? 'MetaBuilder',
        category: indexEntry?.category ?? 'ui',
        dependencies: indexEntry?.dependencies ?? [],
        exports: indexEntry?.exports ?? { components: [] },
      },
      components: [],
      examples: {},
    }

    const [metadata, components, examples] = await Promise.all([
      loadPackageSeedJson(packageId, 'seed/metadata.json', fallbackConfig.metadata),
      loadPackageSeedJson(packageId, 'seed/components.json', fallbackConfig.components),
      loadPackageSeedJson(packageId, 'static_content/examples.json', fallbackConfig.examples),
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

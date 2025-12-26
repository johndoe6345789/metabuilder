import type { PackageTemplateConfig } from './types'

export function buildPackageMetadataJson(config: PackageTemplateConfig): string {
  const componentIds = config.components
    .map((component) => component.id)
    .filter((id): id is string => typeof id === 'string')

  const metadata = {
    packageId: config.packageId,
    name: config.name,
    version: config.version,
    description: config.summary,
    author: config.author,
    category: config.category,
    dependencies: [],
    exports: {
      components: componentIds,
    },
  }

  return JSON.stringify(metadata, null, 2)
}

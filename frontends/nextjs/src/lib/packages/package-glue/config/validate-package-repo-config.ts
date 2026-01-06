import type { PackageRepoConfig } from './types'

export function validatePackageRepoConfig(config: PackageRepoConfig): string[] {
  const errors: string[] = []

  if (config.sources.length === 0) {
    errors.push('At least one package source is required')
  }

  const ids = new Set<string>()
  for (const source of config.sources) {
    if (source.id.length === 0) {
      errors.push('Source ID is required')
    }
    if (ids.has(source.id)) {
      errors.push(`Duplicate source ID: ${source.id}`)
    }
    ids.add(source.id)

    if (source.url.length === 0) {
      errors.push(`Source ${source.id}: URL is required`)
    }

    if (source.type === 'remote' && !source.url.startsWith('http')) {
      errors.push(`Source ${source.id}: Remote URL must start with http(s)`)
    }
  }

  const enabledSources = config.sources.filter((s) => s.enabled)
  if (enabledSources.length === 0) {
    errors.push('At least one source must be enabled')
  }

  return errors
}

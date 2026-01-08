import type { PackageRepoConfig } from './types'
import { DEFAULT_PACKAGE_REPO_CONFIG } from './default-config'
import { DEVELOPMENT_PACKAGE_REPO_CONFIG } from './development-config'
import { PRODUCTION_PACKAGE_REPO_CONFIG } from './production-config'

export function getPackageRepoConfig(): PackageRepoConfig {
  const env = process.env.NODE_ENV
  const enableRemote = process.env.NEXT_PUBLIC_ENABLE_REMOTE_PACKAGES === 'true'

  let config: PackageRepoConfig

  switch (env) {
    case 'production':
      config = { ...PRODUCTION_PACKAGE_REPO_CONFIG }
      break
    case 'development':
    case 'test':
      config = { ...DEVELOPMENT_PACKAGE_REPO_CONFIG }
      break
    default:
      config = { ...DEFAULT_PACKAGE_REPO_CONFIG }
  }

  if (enableRemote) {
    config.sources = config.sources.map((source) => ({
      ...source,
      enabled: source.type === 'remote' ? true : source.enabled,
    }))
  }

  const authToken = process.env.PACKAGE_REGISTRY_AUTH_TOKEN
  if (authToken !== undefined && authToken.length > 0) {
    config.sources = config.sources.map((source) => ({
      ...source,
      authToken: source.type === 'remote' ? authToken : undefined,
    }))
  }

  return config
}

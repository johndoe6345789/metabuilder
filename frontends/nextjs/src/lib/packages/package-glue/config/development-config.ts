import type { PackageRepoConfig } from './types'

export const DEVELOPMENT_PACKAGE_REPO_CONFIG: PackageRepoConfig = {
  conflictResolution: 'local-first',
  sources: [
    {
      id: 'local',
      name: 'Local Development',
      type: 'local',
      url: '/packages',
      priority: 0,
      enabled: true,
    },
    {
      id: 'staging',
      name: 'Staging Registry',
      type: 'remote',
      url: 'https://staging.registry.metabuilder.dev/api/v1',
      priority: 10,
      enabled: false,
    },
  ],
}

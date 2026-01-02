import type { PackageRepoConfig } from './types'

export const PRODUCTION_PACKAGE_REPO_CONFIG: PackageRepoConfig = {
  conflictResolution: 'latest-version',
  sources: [
    {
      id: 'local',
      name: 'Bundled Packages',
      type: 'local',
      url: '/packages',
      priority: 10,
      enabled: true,
    },
    {
      id: 'production',
      name: 'MetaBuilder Registry',
      type: 'remote',
      url: 'https://registry.metabuilder.dev/api/v1',
      priority: 0,
      enabled: false,
    },
  ],
}

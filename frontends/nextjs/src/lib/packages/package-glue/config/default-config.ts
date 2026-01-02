import type { PackageRepoConfig } from './types'

export const DEFAULT_PACKAGE_REPO_CONFIG: PackageRepoConfig = {
  conflictResolution: 'priority',
  sources: [
    {
      id: 'local',
      name: 'Local Packages',
      type: 'local',
      url: '/packages',
      priority: 0,
      enabled: true,
    },
  ],
}

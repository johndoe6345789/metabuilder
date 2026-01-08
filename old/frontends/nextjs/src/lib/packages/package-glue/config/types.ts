export type ConflictResolution = 'priority' | 'latest-version' | 'local-first' | 'remote-first'

export interface PackageSourceConfig {
  id: string
  name: string
  type: 'local' | 'remote'
  url: string
  priority: number
  enabled: boolean
  authToken?: string
}

export interface PackageRepoConfig {
  conflictResolution: ConflictResolution
  sources: PackageSourceConfig[]
}

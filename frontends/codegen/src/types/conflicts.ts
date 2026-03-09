export type ConflictResolutionStrategy = 'local' | 'remote' | 'manual' | 'merge'

export type EntityType = 'files' | 'models' | 'components' | 'workflows' | 'lambdas' | 'componentTrees'

export interface ConflictItem {
  id: string
  entityType: EntityType
  localVersion: any
  remoteVersion: any
  localTimestamp: number
  remoteTimestamp: number
  conflictDetectedAt: number
  resolution?: ConflictResolutionStrategy
  resolvedVersion?: any
  resolvedAt?: number
}

export interface ConflictResolutionResult {
  conflictId: string
  strategy: ConflictResolutionStrategy
  resolvedVersion: any
  timestamp: number
}

export interface ConflictStats {
  totalConflicts: number
  resolvedConflicts: number
  pendingConflicts: number
  conflictsByType: Record<EntityType, number>
}

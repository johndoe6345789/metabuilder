import type { ConflictItem, ConflictResolutionStrategy, ConflictStats, EntityType } from '@/types/conflicts'

export interface ConflictResolutionCopy {
  header: {
    title: string
    description: string
  }
  buttons: {
    detect: string
    clearAll: string
    keepAllLocal: string
    keepAllRemote: string
    mergeAll: string
    checkAgain: string
  }
  stats: {
    total: string
    files: string
    models: string
    other: string
  }
  bulk: {
    title: string
    description: string
    autoResolveLabel: string
    autoResolveOptions: {
      none: string
      local: string
      remote: string
      merge: string
    }
  }
  filters: {
    label: string
    allTypes: string
    files: string
    models: string
    components: string
    workflows: string
    lambdas: string
    componentTrees: string
  }
  badges: {
    conflictCount: string
  }
  emptyStates: {
    filtered: string
    noConflictsTitle: string
    noConflictsDescription: string
  }
  labels: {
    conflictSingular: string
    conflictPlural: string
  }
  toasts: {
    noConflictsDetected: string
    foundConflicts: string
    detectFailed: string
    resolved: string
    resolveFailed: string
    resolvedAll: string
    resolveAllFailed: string
  }
  error: {
    title: string
  }
}

export type ConflictResolutionFilters = EntityType | 'all'

export type ConflictResolutionStats = ConflictStats

export type ConflictResolutionItem = ConflictItem

export type ConflictResolveHandler = (
  conflictId: string,
  strategy: ConflictResolutionStrategy,
) => Promise<void>

export type ConflictResolveAllHandler = (
  strategy: ConflictResolutionStrategy,
) => Promise<void>


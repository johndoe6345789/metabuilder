/** What a workflow may consume when its definition does not say. */

import type { ExecutionLimits } from '@metabuilder/workflow'

export const DEFAULT_EXECUTION_LIMITS: ExecutionLimits = {
  maxExecutionTime: 3600000,
  maxMemoryMb: 512,
  maxNodeExecutions: 1000,
  maxDataSizeMb: 100,
  maxArrayItems: 10000,
}

/** A fresh copy, so a caller mutating limits cannot alter the defaults. */
export function defaultExecutionLimits(): ExecutionLimits {
  return { ...DEFAULT_EXECUTION_LIMITS }
}

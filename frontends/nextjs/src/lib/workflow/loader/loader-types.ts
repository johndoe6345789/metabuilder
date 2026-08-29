/** What the loader answers with, and how it is configured. */

import type {
  ValidationError,
  WorkflowValidationResult,
} from '@metabuilder/workflow'

/** A validation result, plus how it was arrived at. */
export interface ExtendedValidationResult extends WorkflowValidationResult {
  /** Whether the result came from cache. */
  _cacheHit?: boolean
  /** How long validation took, in milliseconds. */
  _validationTime?: number
}

/** Structural metrics and validation summary for one workflow. */
export interface WorkflowDiagnostics {
  workflowId: string
  tenantId: string
  nodeCount: number
  connectionCount: number
  triggerCount: number
  variableCount: number
  validation: {
    valid: boolean
    errorCount: number
    warningCount: number
    topErrors: ValidationError[]
    topWarnings: ValidationError[]
  }
  metrics: {
    validationTimeMs: number
    cacheHit: boolean
  }
}

export interface WorkflowLoaderV2Options {
  /** Enable validation caching (default: true). */
  enableCache?: boolean
  /** Cache TTL in milliseconds (default: one hour). */
  cacheTTLMs?: number
  /** Maximum concurrent validations (default: 10). */
  maxConcurrentValidations?: number
  /** Enable detailed logging (default: false). */
  enableLogging?: boolean
}

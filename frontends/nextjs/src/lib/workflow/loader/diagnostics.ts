/** A workflow's shape and how its last validation went. */

import type { WorkflowDefinition } from '@metabuilder/workflow'
import type {
  ExtendedValidationResult,
  WorkflowDiagnostics,
} from './loader-types'

const TOP_N = 5

export function buildDiagnostics(
  workflow: WorkflowDefinition,
  validation: ExtendedValidationResult
): WorkflowDiagnostics {
  return {
    workflowId: workflow.id,
    tenantId: workflow.tenantId,
    nodeCount: workflow.nodes.length,
    connectionCount: Object.keys(workflow.connections).length,
    triggerCount: workflow.triggers.length,
    variableCount: Object.keys(workflow.variables).length,
    validation: {
      valid: validation.valid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length,
      topErrors: validation.errors.slice(0, TOP_N),
      topWarnings: validation.warnings.slice(0, TOP_N),
    },
    metrics: {
      validationTimeMs: validation._validationTime ?? 0,
      cacheHit: validation._cacheHit ?? false,
    },
  }
}

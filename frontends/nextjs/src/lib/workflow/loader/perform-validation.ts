/**
 * One validation pass, timed.
 *
 * Free-standing because it needs nothing from the loader but a logging
 * flag: the caching, deduplication and batching around it are the
 * loader's job, and this is the part that actually checks the workflow.
 */

import type { WorkflowDefinition } from '@metabuilder/workflow'
import type { ExtendedValidationResult } from './loader-types'
import { validateAll } from './validate-structure'
import { failedResult, passedResult } from './validation-result'

export function performValidation(
  workflow: WorkflowDefinition,
  enableLogging: boolean,
  now: () => number = Date.now
): ExtendedValidationResult {
  const startTime = now()
  try {
    validateAll(workflow)
    const duration = now() - startTime
    if (enableLogging) {
      console.warn(
        `[VALIDATION] Workflow ${workflow.id} validated in ${duration}ms`,
        {
          nodeCount: workflow.nodes.length,
          connectionCount: Object.keys(workflow.connections).length,
        }
      )
    }
    return passedResult(duration)
  } catch (error) {
    console.error(`[VALIDATION ERROR] Workflow ${workflow.id}:`, error)
    return failedResult(error, 'VALIDATION_FAILED', now() - startTime)
  }
}

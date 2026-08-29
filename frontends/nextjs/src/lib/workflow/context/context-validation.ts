/**
 * A dry run of the checks, reported rather than thrown.
 *
 * `build()` refuses on the first thing that makes a context unsafe.
 * This answers the different question a caller asks before committing to
 * a run: everything that is wrong, plus what will merely be dropped.
 */

import type { WorkflowDefinition } from '@metabuilder/workflow'
import type {
  ContextBuilderOptions,
  ContextValidationResult,
  ContextValidationWarning,
  RequestContext,
} from './context-types'
import { collectErrors } from './validation-errors'

function collectWarnings(
  workflow: WorkflowDefinition,
  options: ContextBuilderOptions
): ContextValidationWarning[] {
  const warnings: ContextValidationWarning[] = []

  for (const [name, definition] of Object.entries(workflow.variables)) {
    if (definition.scope !== 'global') continue
    warnings.push({
      path: `variables.${name}`,
      message: 'global-scope variable will be skipped for security',
      severity: 'high',
    })
  }

  const count = workflow.credentials.length
  if (options.enforceCredentialValidation === true && count > 0) {
    warnings.push({
      path: 'credentials',
      message: `${String(count)} credential(s) will be validated during execution`,
      severity: 'low',
    })
  }
  return warnings
}

export function validateContext(
  workflow: WorkflowDefinition,
  request: RequestContext,
  options: ContextBuilderOptions
): ContextValidationResult {
  const errors = collectErrors(workflow, request, options)
  return {
    valid: errors.length === 0,
    errors,
    warnings: collectWarnings(workflow, options),
  }
}

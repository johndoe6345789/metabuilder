/**
 * The invariants a built context must satisfy before anything runs.
 *
 * Collected rather than thrown one at a time, so a caller sees every
 * problem at once instead of fixing them in sequence.
 */

import type { WorkflowDefinition } from '@metabuilder/workflow'
import type {
  ContextBuilderOptions,
  ExtendedWorkflowContext,
} from './context-types'
import { defaultExecutionLimits } from './execution-limits'

export const MIN_USER_LEVEL = 1
export const MAX_USER_LEVEL = 4

export function isValidUserLevel(level: number): boolean {
  return (
    Number.isFinite(level) && level >= MIN_USER_LEVEL && level <= MAX_USER_LEVEL
  )
}

/** Every safety problem with this context; empty when it is sound. */
export function findSafetyErrors(
  context: ExtendedWorkflowContext,
  workflow: Pick<WorkflowDefinition, 'tenantId' | 'executionLimits'>,
  options: Pick<ContextBuilderOptions, 'allowCrossTenantAccess'>
): string[] {
  const errors: string[] = []

  if (
    context.tenantId !== workflow.tenantId &&
    options.allowCrossTenantAccess !== true
  ) {
    errors.push(
      `Context tenant ${context.tenantId} does not match ` +
        `workflow tenant ${workflow.tenantId}`
    )
  }

  if (!isValidUserLevel(context.user.level)) {
    errors.push(`Invalid user level: ${String(context.user.level)}`)
  }

  if (context.executionId.trim() === '') {
    errors.push('Execution ID is required')
  }

  const limit = workflow.executionLimits ?? defaultExecutionLimits()
  if (context.executionLimits.maxExecutionTime > limit.maxExecutionTime) {
    errors.push(
      `Requested execution time ` +
        `(${String(context.executionLimits.maxExecutionTime)}ms) ` +
        `exceeds workflow limit (${String(limit.maxExecutionTime)}ms)`
    )
  }

  return errors
}

/** Throws with every problem listed, or returns having found none. */
export function assertContextSafe(
  context: ExtendedWorkflowContext,
  workflow: Pick<WorkflowDefinition, 'tenantId' | 'executionLimits'>,
  options: Pick<ContextBuilderOptions, 'allowCrossTenantAccess'>
): void {
  const errors = findSafetyErrors(context, workflow, options)
  if (errors.length === 0) return
  throw new Error(
    `Context validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
  )
}

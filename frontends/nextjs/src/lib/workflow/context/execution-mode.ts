/** Which kind of run a trigger describes. */

import type { WorkflowTrigger } from '@metabuilder/workflow'
import type { ExecutionMode } from './context-types'

const MODE_BY_KIND: Record<string, ExecutionMode> = {
  schedule: 'scheduled',
  webhook: 'webhook',
  'webhook-listen': 'webhook',
  manual: 'api',
  event: 'api',
  email: 'api',
  'message-queue': 'api',
  polling: 'api',
  custom: 'api',
}

/**
 * A run with no trigger at all is a manual one. Note that a trigger whose
 * kind is 'manual' reports 'api': the mode describes how the run reached
 * the engine, and a manual trigger still arrives through the API.
 */
export function determineExecutionMode(
  trigger?: WorkflowTrigger
): ExecutionMode {
  if (trigger == null) return 'manual'
  return MODE_BY_KIND[trigger.kind] ?? 'manual'
}

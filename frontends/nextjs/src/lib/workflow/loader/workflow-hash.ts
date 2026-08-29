/**
 * A cache key that changes when the workflow does.
 *
 * Structural parts only: a run count or a saved-at timestamp changing must
 * not invalidate a validation that is still correct.
 */

import type { WorkflowDefinition } from '@metabuilder/workflow'

/** djb2-style. Not cryptographic -- this only has to notice a change. */
export function hashWorkflow(workflow: WorkflowDefinition): string {
  const key = JSON.stringify({
    nodes: workflow.nodes,
    connections: workflow.connections,
    variables: workflow.variables,
    triggers: workflow.triggers,
  })

  let hash = 5381
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) ^ key.charCodeAt(i)
  }
  return Math.abs(hash).toString(16)
}

/** `tenant:workflow:hash` -- tenant first, so a prefix scan is per tenant. */
export function cacheKeyFor(workflow: WorkflowDefinition): string {
  return `${workflow.tenantId}:${workflow.id}:${hashWorkflow(workflow)}`
}

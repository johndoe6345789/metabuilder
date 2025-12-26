import { getAdapter } from '../../core/dbal-client'
import type { Workflow } from '../../types/level-types'

/**
 * Add a workflow
 */
export async function addWorkflow(workflow: Workflow): Promise<void> {
  const adapter = getAdapter()
  await adapter.create('Workflow', {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    nodes: JSON.stringify(workflow.nodes),
    edges: JSON.stringify(workflow.edges),
    enabled: workflow.enabled,
  })
}

import { getAdapter } from '../../core/dbal-client'
import type { Workflow } from '../../types/level-types'

/**
 * Set all workflows (replaces existing)
 */
export async function setWorkflows(workflows: Workflow[]): Promise<void> {
  const adapter = getAdapter()
  
  // Delete existing workflows
  const existing = await adapter.list('Workflow')
  for (const w of existing.data as any[]) {
    await adapter.delete('Workflow', w.id)
  }
  
  // Create new workflows
  for (const workflow of workflows) {
    await adapter.create('Workflow', {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      nodes: JSON.stringify(workflow.nodes),
      edges: JSON.stringify(workflow.edges),
      enabled: workflow.enabled,
    })
  }
}

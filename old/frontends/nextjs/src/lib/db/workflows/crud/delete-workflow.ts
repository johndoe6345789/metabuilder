import { getAdapter } from '../../core/dbal-client'

/**
 * Delete a workflow by ID
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  const adapter = getAdapter()
  await adapter.delete('Workflow', workflowId)
}

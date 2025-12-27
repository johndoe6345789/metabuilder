/**
 * @file delete-workflow.ts
 * @description Delete workflow operation
 */
import type { Result } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'
import { validateId } from '../../validation/validate-id'

/**
 * Delete a workflow by ID
 */
export const deleteWorkflow = async (store: InMemoryStore, id: string): Promise<Result<boolean>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const workflow = store.workflows.get(id)
  if (!workflow) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Workflow not found: ${id}` } }
  }

  store.workflows.delete(id)
  store.workflowNames.delete(workflow.name)

  return { success: true, data: true }
}

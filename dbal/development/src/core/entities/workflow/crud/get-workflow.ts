/**
 * @file get-workflow.ts
 * @description Get workflow operation
 */
import type { Result, Workflow } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'

/**
 * Get a workflow by ID
 */
export const getWorkflow = async (store: InMemoryStore, id: string): Promise<Result<Workflow>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const workflow = store.workflows.get(id)
  if (!workflow) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Workflow not found: ${id}` } }
  }

  return { success: true, data: workflow }
}

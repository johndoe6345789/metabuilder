/**
 * @file update-workflow.ts
 * @description Update workflow operation
 */
import type { Result, UpdateWorkflowInput, Workflow } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'
import { validateId } from '../../validation/validate-id'
import { validateWorkflowUpdate } from '../../validation/validate-workflow-update'

/**
 * Update an existing workflow
 */
export const updateWorkflow = async (
  store: InMemoryStore,
  id: string,
  input: UpdateWorkflowInput
): Promise<Result<Workflow>> => {
  const idErrors = validateId(id)
  if (idErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] } }
  }

  const workflow = store.workflows.get(id)
  if (!workflow) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Workflow not found: ${id}` } }
  }

  const validationErrors = validateWorkflowUpdate(input)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] } }
  }

  if (input.name && input.name !== workflow.name) {
    if (store.workflowNames.has(input.name)) {
      return { success: false, error: { code: 'CONFLICT', message: 'Workflow name already exists' } }
    }
    store.workflowNames.delete(workflow.name)
    store.workflowNames.set(input.name, id)
    workflow.name = input.name
  }

  if (input.description !== undefined) {
    workflow.description = input.description
  }

  if (input.trigger !== undefined) {
    workflow.trigger = input.trigger
  }

  if (input.triggerConfig !== undefined) {
    workflow.triggerConfig = input.triggerConfig
  }

  if (input.steps !== undefined) {
    workflow.steps = input.steps
  }

  if (input.isActive !== undefined) {
    workflow.isActive = input.isActive
  }

  if (input.createdBy !== undefined) {
    workflow.createdBy = input.createdBy
  }

  workflow.updatedAt = new Date()

  return { success: true, data: workflow }
}

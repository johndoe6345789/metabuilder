/**
 * @file create-workflow.ts
 * @description Create workflow operation
 */
import type { CreateWorkflowInput, Result, Workflow } from '../../types'
import type { InMemoryStore } from '../../store/in-memory-store'
import { validateWorkflowCreate } from '../../validation/validate-workflow-create'

/**
 * Create a new workflow in the store
 */
export const createWorkflow = async (
  store: InMemoryStore,
  input: CreateWorkflowInput
): Promise<Result<Workflow>> => {
  const isActive = input.isActive ?? true
  const validationErrors = validateWorkflowCreate({
    name: input.name,
    description: input.description,
    trigger: input.trigger,
    triggerConfig: input.triggerConfig,
    steps: input.steps,
    isActive,
    createdBy: input.createdBy
  })

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] } }
  }

  if (store.workflowNames.has(input.name)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Workflow name already exists' } }
  }

  const workflow: Workflow = {
    id: store.generateId('workflow'),
    name: input.name,
    description: input.description,
    trigger: input.trigger,
    triggerConfig: input.triggerConfig,
    steps: input.steps,
    isActive,
    createdBy: input.createdBy,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  store.workflows.set(workflow.id, workflow)
  store.workflowNames.set(workflow.name, workflow.id)

  return { success: true, data: workflow }
}

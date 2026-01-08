/**
 * @file update-workflow.ts
 * @description Update workflow operation
 */
import type { Result, UpdateWorkflowInput, Workflow } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateId } from '../validation/validate-id'
import { validateWorkflowUpdate } from '../validation/validate-workflow-update'

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
    return { success: false, error: { code: 'VALIDATION_ERROR', message: idErrors[0] || 'Invalid ID' } }
  }

  if (input.tenantId !== undefined) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'tenantId is immutable' } }
  }

  const workflow = store.workflows.get(id)
  if (!workflow) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Workflow not found: ${id}` } }
  }

  const validationErrors = validateWorkflowUpdate({
    ...input,
    description: input.description ?? undefined,
  } as Partial<Workflow>)
  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] || 'Validation failed' } }
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

  if (input.nodes !== undefined) {
    workflow.nodes = input.nodes
  }

  if (input.edges !== undefined) {
    workflow.edges = input.edges
  }

  if (input.enabled !== undefined) {
    workflow.enabled = input.enabled
  }

  if (input.version !== undefined) {
    workflow.version = input.version
  }

  if (input.createdBy !== undefined) {
    workflow.createdBy = input.createdBy ?? null
  }

  workflow.updatedAt = input.updatedAt ?? BigInt(Date.now())

  return { success: true, data: workflow }
}

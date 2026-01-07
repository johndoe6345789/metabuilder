/**
 * @file create-workflow.ts
 * @description Create workflow operation
 */
import type { CreateWorkflowInput, Result, Workflow } from '../types'
import type { InMemoryStore } from '../store/in-memory-store'
import { validateWorkflowCreate } from '../validation/validate-workflow-create'

/**
 * Create a new workflow in the store
 */
export const createWorkflow = async (
  store: InMemoryStore,
  input: CreateWorkflowInput
): Promise<Result<Workflow>> => {
  const now = BigInt(Date.now())
  const workflow: Workflow = {
    id: input.id ?? store.generateId('workflow'),
    tenantId: input.tenantId ?? null,
    name: input.name,
    description: input.description,
    nodes: input.nodes,
    edges: input.edges,
    enabled: input.enabled ?? true,
    version: input.version ?? 1,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    createdBy: input.createdBy ?? null
  }

  const validationErrors = validateWorkflowCreate(workflow)

  if (validationErrors.length > 0) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0] ?? 'Validation failed' } }
  }

  if (store.workflowNames.has(input.name)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Workflow name already exists' } }
  }

  store.workflows.set(workflow.id, workflow)
  store.workflowNames.set(workflow.name, workflow.id)

  return { success: true, data: workflow }
}

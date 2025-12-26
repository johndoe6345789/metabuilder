/**
 * @file create-workflow.ts
 * @description Create workflow operation
 */
import type { Workflow, CreateWorkflowInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateWorkflowType } from '../validation/workflow-validation';

/**
 * Create a new workflow in the store
 */
export async function createWorkflow(
  store: InMemoryStore,
  input: CreateWorkflowInput
): Promise<Result<Workflow>> {
  if (!input.name || input.name.length > 100) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required (max 100)' } };
  }
  if (!input.type || !validateWorkflowType(input.type)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid workflow type' } };
  }

  const workflow: Workflow = {
    id: store.generateId('workflow'),
    name: input.name,
    description: input.description ?? '',
    type: input.type,
    config: input.config ?? {},
    isActive: input.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.workflows.set(workflow.id, workflow);
  return { success: true, data: workflow };
}

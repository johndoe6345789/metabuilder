/**
 * @file update-workflow.ts
 * @description Update workflow operation
 */
import type { Workflow, UpdateWorkflowInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateWorkflowType } from '../validation/workflow-validation';

/**
 * Update an existing workflow
 */
export async function updateWorkflow(
  store: InMemoryStore,
  id: string,
  input: UpdateWorkflowInput
): Promise<Result<Workflow>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const workflow = store.workflows.get(id);
  if (!workflow) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Workflow not found: ${id}` } };
  }

  if (input.name !== undefined) {
    if (!input.name || input.name.length > 100) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid name' } };
    }
    workflow.name = input.name;
  }

  if (input.type !== undefined) {
    if (!validateWorkflowType(input.type)) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid type' } };
    }
    workflow.type = input.type;
  }

  if (input.description !== undefined) workflow.description = input.description;
  if (input.config !== undefined) workflow.config = input.config;
  if (input.isActive !== undefined) workflow.isActive = input.isActive;

  workflow.updatedAt = new Date();
  return { success: true, data: workflow };
}

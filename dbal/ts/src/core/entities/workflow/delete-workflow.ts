/**
 * @file delete-workflow.ts
 * @description Delete workflow operation
 */
import type { Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Delete a workflow by ID
 */
export async function deleteWorkflow(store: InMemoryStore, id: string): Promise<Result<boolean>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const workflow = store.workflows.get(id);
  if (!workflow) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Workflow not found: ${id}` } };
  }

  store.workflows.delete(id);
  return { success: true, data: true };
}

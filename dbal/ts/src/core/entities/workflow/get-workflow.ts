/**
 * @file get-workflow.ts
 * @description Get workflow operation
 */
import type { Workflow, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Get a workflow by ID
 */
export async function getWorkflow(store: InMemoryStore, id: string): Promise<Result<Workflow>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const workflow = store.workflows.get(id);
  if (!workflow) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Workflow not found: ${id}` } };
  }

  return { success: true, data: workflow };
}

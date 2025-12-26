/**
 * @file delete-page.ts
 * @description Delete page operation
 */
import type { Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Delete a page by ID
 */
export async function deletePage(store: InMemoryStore, id: string): Promise<Result<boolean>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const page = store.pages.get(id);
  if (!page) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${id}` } };
  }

  store.pageSlugs.delete(page.slug);
  store.pages.delete(id);

  return { success: true, data: true };
}

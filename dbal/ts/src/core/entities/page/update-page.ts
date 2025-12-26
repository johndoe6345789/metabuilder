/**
 * @file update-page.ts
 * @description Update page operation
 */
import type { PageView, UpdatePageInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateSlug } from '../validation/page-validation';

/**
 * Update an existing page
 */
export async function updatePage(
  store: InMemoryStore,
  id: string,
  input: UpdatePageInput
): Promise<Result<PageView>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const page = store.pages.get(id);
  if (!page) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${id}` } };
  }

  if (input.slug !== undefined) {
    if (!validateSlug(input.slug)) {
      return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid slug' } };
    }
    const existingId = store.pageSlugs.get(input.slug);
    if (existingId && existingId !== id) {
      return { success: false, error: { code: 'CONFLICT', message: 'Slug exists' } };
    }
    store.pageSlugs.delete(page.slug);
    store.pageSlugs.set(input.slug, id);
    page.slug = input.slug;
  }

  if (input.title !== undefined) page.title = input.title;
  if (input.description !== undefined) page.description = input.description;
  if (input.level !== undefined) page.level = input.level;
  if (input.layout !== undefined) page.layout = input.layout;
  if (input.isActive !== undefined) page.isActive = input.isActive;

  page.updatedAt = new Date();
  return { success: true, data: page };
}

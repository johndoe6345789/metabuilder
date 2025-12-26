/**
 * @file create-page.ts
 * @description Create page operation
 */
import type { PageView, CreatePageInput, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';
import { validateSlug } from '../validation/page-validation';

/**
 * Create a new page in the store
 */
export async function createPage(
  store: InMemoryStore,
  input: CreatePageInput
): Promise<Result<PageView>> {
  if (!validateSlug(input.slug)) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid slug format' } };
  }
  if (!input.title || input.title.length > 200) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title required (max 200)' } };
  }
  if (input.level < 0 || input.level > 5) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Level must be 0-5' } };
  }

  if (store.pageSlugs.has(input.slug)) {
    return { success: false, error: { code: 'CONFLICT', message: 'Slug already exists' } };
  }

  const page: PageView = {
    id: store.generateId('page'),
    slug: input.slug,
    title: input.title,
    description: input.description ?? '',
    level: input.level,
    layout: input.layout ?? 'default',
    isActive: input.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.pages.set(page.id, page);
  store.pageSlugs.set(page.slug, page.id);

  return { success: true, data: page };
}

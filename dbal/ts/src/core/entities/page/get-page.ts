/**
 * @file get-page.ts
 * @description Get page operations
 */
import type { PageView, Result } from '../types';
import type { InMemoryStore } from '../store/in-memory-store';

/**
 * Get a page by ID
 */
export async function getPage(store: InMemoryStore, id: string): Promise<Result<PageView>> {
  if (!id) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'ID required' } };
  }

  const page = store.pages.get(id);
  if (!page) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${id}` } };
  }

  return { success: true, data: page };
}

/**
 * Get a page by slug
 */
export async function getPageBySlug(store: InMemoryStore, slug: string): Promise<Result<PageView>> {
  if (!slug) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Slug required' } };
  }

  const id = store.pageSlugs.get(slug);
  if (!id) {
    return { success: false, error: { code: 'NOT_FOUND', message: `Page not found: ${slug}` } };
  }

  return getPage(store, id);
}

/**
 * @file page-validation.ts
 * @description Page validation functions
 */

const SLUG_REGEX = /^[a-z0-9-]+$/;

/**
 * Validate slug format (lowercase, alphanumeric, hyphens only)
 */
export function validateSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 100 && SLUG_REGEX.test(slug);
}

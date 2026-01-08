/**
 * @file is-valid-slug.ts
 * @description Validate slug format
 */

import { isValidSlug as isValidSlugPredicate } from './predicates/string/is-valid-slug'

export const isValidSlug = (slug: string): boolean => isValidSlugPredicate(slug)

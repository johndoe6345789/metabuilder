import { isValidSlug as isValidSlugPredicate } from '../../validation/predicates/string/is-valid-slug'

export const isValidSlug = (slug: string): boolean => isValidSlugPredicate(slug)

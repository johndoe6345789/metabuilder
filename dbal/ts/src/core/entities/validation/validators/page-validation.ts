/**
 * @file page-validation.ts
 * @description Page validation functions
 */
import { isValidSlug } from '../../validation/is-valid-slug'

export const validateSlug = (slug: string): boolean => isValidSlug(slug)

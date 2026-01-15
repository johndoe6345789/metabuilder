/**
 * @file is-valid-title.ts
 * @description Validate title format
 */

import { isValidTitle as isValidTitlePredicate } from './predicates/string/is-valid-title'

export const isValidTitle = (title: string): boolean => isValidTitlePredicate(title)

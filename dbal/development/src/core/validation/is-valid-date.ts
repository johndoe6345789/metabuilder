/**
 * @file is-valid-date.ts
 * @description Validate date format
 */

import { isValidDate as isValidDatePredicate } from './predicates/is-valid-date'

export const isValidDate = (value: unknown): boolean => isValidDatePredicate(value)

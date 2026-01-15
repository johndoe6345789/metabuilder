/**
 * @file is-valid-level.ts
 * @description Validate permission level
 */

import { isValidLevel as isValidLevelPredicate } from './predicates/is-valid-level'

export const isValidLevel = (level: number): boolean => isValidLevelPredicate(level)

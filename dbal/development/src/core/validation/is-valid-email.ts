/**
 * @file is-valid-email.ts
 * @description Validate email format
 */

import { isValidEmail as isValidEmailPredicate } from './predicates/string/is-valid-email'

export const isValidEmail = (email: string): boolean => isValidEmailPredicate(email)

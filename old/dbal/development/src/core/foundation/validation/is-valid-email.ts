/**
 * @file is-valid-email.ts
 * @description Email validation
 */
import { isValidEmail as isValidEmailPredicate } from '../../validation/predicates/string/is-valid-email'

export const isValidEmail = (email: string): boolean => isValidEmailPredicate(email)

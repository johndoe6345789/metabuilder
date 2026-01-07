/**
 * @file is-valid-username.ts
 * @description Validate username format
 */

import { isValidUsername as isValidUsernamePredicate } from './predicates/string/is-valid-username'

export const isValidUsername = (username: string): boolean => isValidUsernamePredicate(username)

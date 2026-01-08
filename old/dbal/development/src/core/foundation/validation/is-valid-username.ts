import { isValidUsername as isValidUsernamePredicate } from '../../validation/predicates/string/is-valid-username'

export const isValidUsername = (username: string): boolean => isValidUsernamePredicate(username)

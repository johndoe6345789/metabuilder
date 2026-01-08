import { isValidSemver as isValidSemverPredicate } from '../../validation/predicates/string/is-valid-semver'

export const isValidSemver = (version: string): boolean => isValidSemverPredicate(version)

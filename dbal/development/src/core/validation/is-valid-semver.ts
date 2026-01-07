/**
 * @file is-valid-semver.ts
 * @description Validate semantic versioning format
 */

import { isValidSemver as isValidSemverPredicate } from './predicates/string/is-valid-semver'

export const isValidSemver = (version: string): boolean => isValidSemverPredicate(version)

/**
 * @file package-validation.ts
 * @description Package validation functions
 */
import { isValidSemver } from '../../validation/is-valid-semver'

const PACKAGE_ID_REGEX = /^[a-z0-9_]+$/

export const validatePackageId = (packageId: string): boolean => {
  return packageId.length > 0 && packageId.length <= 255 && PACKAGE_ID_REGEX.test(packageId)
}

export const validateVersion = (version: string): boolean => isValidSemver(version)

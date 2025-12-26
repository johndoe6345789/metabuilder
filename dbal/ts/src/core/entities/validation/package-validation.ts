/**
 * @file package-validation.ts
 * @description Package validation functions
 */

const PACKAGE_ID_REGEX = /^[a-z0-9_]+$/;
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Validate package ID format (snake_case)
 */
export function validatePackageId(packageId: string): boolean {
  return packageId.length > 0 && packageId.length <= 50 && PACKAGE_ID_REGEX.test(packageId);
}

/**
 * Validate version format (semver: x.y.z)
 */
export function validateVersion(version: string): boolean {
  return VERSION_REGEX.test(version);
}

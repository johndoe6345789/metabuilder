import type { InstalledPackage } from '../types'
import { isValidSemver } from '../../predicates/string/is-valid-semver'
import { isValidJsonString } from '../../predicates/string/is-valid-json'

export function validatePackageCreate(data: Partial<InstalledPackage>): string[] {
  const errors: string[] = []

  if (!data.packageId) {
    errors.push('packageId is required')
  } else if (typeof data.packageId !== 'string' || data.packageId.trim().length === 0) {
    errors.push('packageId must be a non-empty string')
  }

  if (data.installedAt === undefined) {
    errors.push('installedAt is required')
  } else if (typeof data.installedAt !== 'bigint') {
    errors.push('installedAt must be a bigint timestamp')
  }

  if (!data.version) {
    errors.push('version is required')
  } else if (typeof data.version !== 'string' || !isValidSemver(data.version)) {
    errors.push('version must be semantic (x.y.z)')
  }

  if (data.enabled === undefined) {
    errors.push('enabled is required')
  } else if (typeof data.enabled !== 'boolean') {
    errors.push('enabled must be a boolean')
  }

  if (data.config !== undefined && data.config !== null) {
    if (typeof data.config !== 'string' || !isValidJsonString(data.config)) {
      errors.push('config must be a JSON string')
    }
  }

  if (data.tenantId !== undefined && data.tenantId !== null && typeof data.tenantId !== 'string') {
    errors.push('tenantId must be a string')
  }

  return errors
}

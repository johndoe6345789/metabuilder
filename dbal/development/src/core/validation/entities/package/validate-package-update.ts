import type { InstalledPackage } from '../types'
import { isValidSemver } from '../../predicates/string/is-valid-semver'
import { isValidJsonString } from '../../predicates/string/is-valid-json'

export function validatePackageUpdate(data: Partial<InstalledPackage>): string[] {
  const errors: string[] = []

  if (data.installedAt !== undefined && typeof data.installedAt !== 'bigint') {
    errors.push('installedAt must be a bigint timestamp')
  }

  if (data.version !== undefined) {
    if (typeof data.version !== 'string' || !isValidSemver(data.version)) {
      errors.push('version must be semantic (x.y.z)')
    }
  }

  if (data.enabled !== undefined && typeof data.enabled !== 'boolean') {
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

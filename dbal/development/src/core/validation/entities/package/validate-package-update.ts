import type { Package } from '../types'
import { isPlainObject } from '../../predicates/is-plain-object'
import { isValidDate } from '../../predicates/is-valid-date'
import { isValidSemver } from '../../predicates/string/is-valid-semver'
import { isValidUuid } from '../../predicates/is-valid-uuid'

export function validatePackageUpdate(data: Partial<Package>): string[] {
  const errors: string[] = []

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.length === 0 || data.name.length > 255) {
      errors.push('name must be 1-255 characters')
    }
  }

  if (data.version !== undefined) {
    if (typeof data.version !== 'string' || !isValidSemver(data.version)) {
      errors.push('version must be semantic (x.y.z)')
    }
  }

  if (data.author !== undefined) {
    if (typeof data.author !== 'string' || data.author.length === 0 || data.author.length > 255) {
      errors.push('author must be 1-255 characters')
    }
  }

  if (data.manifest !== undefined && !isPlainObject(data.manifest)) {
    errors.push('manifest must be an object')
  }

  if (data.isInstalled !== undefined && typeof data.isInstalled !== 'boolean') {
    errors.push('isInstalled must be a boolean')
  }

  if (data.installedAt !== undefined && !isValidDate(data.installedAt)) {
    errors.push('installedAt must be a valid date')
  }

  if (data.installedBy !== undefined) {
    if (typeof data.installedBy !== 'string' || !isValidUuid(data.installedBy)) {
      errors.push('installedBy must be a valid UUID')
    }
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('description must be a string')
  }

  return errors
}

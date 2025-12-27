import { isValidUuid } from '../predicates/is-valid-uuid'

export function validateId(id: string): string[] {
  const errors: string[] = []

  if (!id || id.trim().length === 0) {
    errors.push('ID cannot be empty')
    return errors
  }

  if (!isValidUuid(id.trim())) {
    errors.push('ID must be a valid UUID')
  }

  return errors
}

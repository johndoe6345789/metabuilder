export function validateId(id: string): string[] {
  const errors: string[] = []

  if (!id || id.trim().length === 0) {
    errors.push('ID cannot be empty')
    return errors
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidPattern.test(id.trim())) {
    errors.push('ID must be a valid UUID')
  }

  return errors
}

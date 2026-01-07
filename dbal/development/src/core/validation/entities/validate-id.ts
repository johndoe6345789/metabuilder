export function validateId(id: string): string[] {
  const errors: string[] = []

  if (!id || id.trim().length === 0) {
    errors.push('ID cannot be empty')
    return errors
  }

  return errors
}

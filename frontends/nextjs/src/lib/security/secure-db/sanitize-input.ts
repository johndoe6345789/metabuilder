/**
 * Sanitize user input to prevent XSS and injection attacks
 */
export function sanitizeInput<T>(input: T): T {
  if (typeof input === 'string') {
    return input.replace(/[<>'"]/g, '') as T
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item)) as T
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, unknown> = {}
    for (const key in input) {
      sanitized[key] = sanitizeInput((input as Record<string, unknown>)[key])
    }
    return sanitized as T
  }
  return input
}

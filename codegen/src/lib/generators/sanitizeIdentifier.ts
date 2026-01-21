type SanitizeIdentifierOptions = {
  fallback?: string
}

export function sanitizeIdentifier(value: string, options: SanitizeIdentifierOptions = {}): string {
  const fallback = options.fallback ?? 'identifier'
  const trimmed = value.trim()
  const normalized = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')

  if (!normalized) {
    return fallback
  }

  if (/^[0-9]/.test(normalized)) {
    return `_${normalized}`
  }

  return normalized
}

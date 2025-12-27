// Slug validation: lowercase alphanumeric with hyphens and slashes (1-255 chars)
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0 || slug.length > 255) {
    return false
  }
  const slugPattern = /^[a-z0-9-/]+$/
  return slugPattern.test(slug)
}

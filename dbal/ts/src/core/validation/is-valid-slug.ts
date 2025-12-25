// Slug validation: lowercase alphanumeric with hyphens (1-100 chars)
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length === 0 || slug.length > 100) {
    return false
  }
  const slugPattern = /^[a-z0-9-]+$/
  return slugPattern.test(slug)
}

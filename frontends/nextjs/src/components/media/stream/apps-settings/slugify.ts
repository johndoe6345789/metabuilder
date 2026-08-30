/** A URL/id-safe slug from a display name, never empty. */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug === '' ? 'app' : slug
}

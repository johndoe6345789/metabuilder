/**
 * A CSS class name from whatever the user typed. They should be able to call
 * a style "Big red heading" without learning that a class cannot contain
 * spaces or start with a digit.
 */
export function toClassName(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (slug === '') return 'style'
  return /^[0-9]/.test(slug) ? `s-${slug}` : slug
}

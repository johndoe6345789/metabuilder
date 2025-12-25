import { describe, expect, it } from 'vitest'
import { isValidSlug } from './is-valid-slug'

describe('isValidSlug', () => {
  it.each([
    { slug: 'home' },
    { slug: 'docs/getting-started' },
    { slug: 'a-b/c' },
  ])('accepts $slug', ({ slug }) => {
    expect(isValidSlug(slug)).toBe(true)
  })

  it.each([
    { slug: 'Home' },
    { slug: 'has spaces' },
    { slug: 'a'.repeat(256) },
  ])('rejects $slug', ({ slug }) => {
    expect(isValidSlug(slug)).toBe(false)
  })
})

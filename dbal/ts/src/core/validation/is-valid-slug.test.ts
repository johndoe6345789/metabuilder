import { describe, it, expect } from 'vitest'
import { isValidSlug } from './is-valid-slug'

describe('isValidSlug', () => {
  it.each([
    { name: 'letters and hyphens', slug: 'my-page', expected: true },
    { name: 'digits', slug: 'page-123', expected: true },
    { name: 'max length', slug: 'a'.repeat(100), expected: true },
    { name: 'empty', slug: '', expected: false },
    { name: 'uppercase', slug: 'My-page', expected: false },
    { name: 'underscore', slug: 'my_page', expected: false },
    { name: 'too long', slug: 'a'.repeat(101), expected: false },
    { name: 'invalid char', slug: 'page!', expected: false },
  ])('returns $expected for $name', ({ slug, expected }) => {
    expect(isValidSlug(slug)).toBe(expected)
  })
})

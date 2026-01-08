import { describe, it, expect } from 'vitest'
import { isValidSlug } from '../../../src/core/validation/is-valid-slug'

const maxSlug = 'a'.repeat(255)
const tooLongSlug = 'a'.repeat(256)

describe('isValidSlug', () => {
  it.each([
    { slug: 'my-page-1', expected: true, description: 'lowercase with hyphens' },
    { slug: 'docs/getting-started', expected: true, description: 'includes slashes' },
    { slug: 'a', expected: true, description: 'single character' },
    { slug: maxSlug, expected: true, description: 'max length' },
    { slug: '', expected: false, description: 'empty string' },
    { slug: tooLongSlug, expected: false, description: 'too long' },
    { slug: 'My-page', expected: false, description: 'uppercase letters' },
    { slug: 'page_name', expected: false, description: 'underscore' },
    { slug: 'page!', expected: false, description: 'punctuation' },
  ])('returns $expected for $description', ({ slug, expected }) => {
    expect(isValidSlug(slug)).toBe(expected)
  })
})

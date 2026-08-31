import { describe, it, expect } from 'vitest'
import { toClassName } from './to-class-name'

describe('toClassName', () => {
  it('lowercases and hyphenates a phrase', () => {
    expect(toClassName('Big Red Heading')).toBe('big-red-heading')
  })

  it('collapses runs of punctuation into one hyphen', () => {
    expect(toClassName('a__b   c!!d')).toBe('a-b-c-d')
  })

  it('trims leading and trailing hyphens', () => {
    expect(toClassName('  -leading and trailing-  ')).toBe(
      'leading-and-trailing'
    )
  })

  it('falls back to "style" for a name with no usable characters', () => {
    expect(toClassName('   ')).toBe('style')
    expect(toClassName('!!!')).toBe('style')
  })

  it('prefixes a leading digit, since a class cannot start with one', () => {
    expect(toClassName('3rd tier')).toBe('s-3rd-tier')
  })
})

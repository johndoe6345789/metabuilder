import { describe, expect, it } from 'vitest'

import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Netflix App')).toBe('netflix-app')
  })

  it('collapses runs of non-alphanumeric characters', () => {
    expect(slugify('A --- B!!!C')).toBe('a-b-c')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('---edge---')).toBe('edge')
  })

  it('falls back to "app" when nothing alphanumeric remains', () => {
    expect(slugify('!!!')).toBe('app')
  })

  it('falls back to "app" for a blank name', () => {
    expect(slugify('')).toBe('app')
  })
})

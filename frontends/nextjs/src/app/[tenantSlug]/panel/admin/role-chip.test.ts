import { describe, expect, it } from 'vitest'

import { roleColor } from './role-chip'

describe('roleColor', () => {
  it.each([
    ['god', 'secondary'],
    ['supergod', 'secondary'],
    ['admin', 'primary'],
  ])('marks %s as %s', (role, expected) => {
    expect(roleColor(role)).toBe(expected)
  })

  it.each(['user', 'moderator', 'guest', ''])(
    'leaves %s uncoloured',
    role => {
      expect(roleColor(role)).toBe('default')
    }
  )
})

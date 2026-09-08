import { describe, expect, it } from 'vitest'

import { levelColor, visibilityLabel } from './page-list-levels'

describe('levelColor', () => {
  it('has a colour per level the form offers', () => {
    expect(levelColor(0)).toBe('default')
    expect(levelColor(3)).toBe('warning')
    expect(levelColor(5)).toBe('secondary')
  })

  it('falls back to default for a level it has no colour for', () => {
    expect(levelColor(42)).toBe('default')
  })
})

/**
 * "/minutes" was set to Admin and the list showed it as "Admin" and
 * "Public" side by side, because the second chip read requiresAuth alone.
 * The chip says what the server gate does.
 */
describe('visibilityLabel', () => {
  it('is public when nothing restricts the page', () => {
    expect(visibilityLabel({ level: 0, requiresAuth: false })).toBe('Public')
  })

  it('needs a sign-in when the level does, even with requiresAuth off', () => {
    expect(visibilityLabel({ level: 3, requiresAuth: false })).toBe('Sign-in')
  })

  it('needs a sign-in when requiresAuth is set on a level-0 page', () => {
    expect(visibilityLabel({ level: 0, requiresAuth: true })).toBe('Sign-in')
  })

  it('needs a sign-in when only requiredRole restricts it', () => {
    expect(
      visibilityLabel({ level: 0, requiresAuth: false, requiredRole: 'user' })
    ).toBe('Sign-in')
  })
})

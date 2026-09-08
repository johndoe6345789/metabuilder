import { describe, expect, it } from 'vitest'

import { PAGE_LEVELS, pageLevelLabel, requiredPageLevel } from './page-levels'

/**
 * The route list had its own table -- 1: Public, 2: User, 3: Admin --
 * while the form that writes the field, ROLE_LEVELS and the server gate
 * all count from 0. So a public page listed as "L0", a users-only page as
 * "Public", and a moderators-only page as "User": the list told a founder
 * the opposite of who could see each page. One table now.
 */
describe('PAGE_LEVELS', () => {
  it('counts from public at 0, the way the field is stored', () => {
    expect(PAGE_LEVELS.map(l => [l.value, l.label])).toEqual([
      [0, 'Public'],
      [1, 'User'],
      [2, 'Moderator'],
      [3, 'Admin'],
      [4, 'God'],
      [5, 'SuperGod'],
    ])
  })
})

describe('pageLevelLabel', () => {
  it('names a level the form offers', () => {
    expect(pageLevelLabel(0)).toBe('Public')
    expect(pageLevelLabel(3)).toBe('Admin')
  })

  it('shows the raw number for one the form does not', () => {
    expect(pageLevelLabel(9)).toBe('L9')
  })
})

describe('requiredPageLevel', () => {
  const page = { level: 0, requiresAuth: false, requiredRole: null }

  it('is public when nothing restricts the page', () => {
    expect(requiredPageLevel(page)).toBe(0)
  })

  it('reads requiresAuth as any signed-in visitor', () => {
    expect(requiredPageLevel({ ...page, requiresAuth: true })).toBe(1)
  })

  it('takes the highest of level, requiresAuth and requiredRole', () => {
    expect(
      requiredPageLevel({ level: 1, requiresAuth: true, requiredRole: 'admin' })
    ).toBe(3)
    expect(requiredPageLevel({ ...page, level: 2 })).toBe(2)
  })

  it('ignores an empty or absent requiredRole', () => {
    expect(requiredPageLevel({ ...page, requiredRole: '' })).toBe(0)
    expect(requiredPageLevel({ level: 0, requiresAuth: false })).toBe(0)
  })
})
